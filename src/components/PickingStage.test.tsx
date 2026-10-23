import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { searchMovies } from "../lib/tmdb";
import type { Lobby } from "../lib/types";
import { addPick, removePick, setStage } from "../services/lobby";
import { PickingStage } from "./PickingStage";

vi.mock("../services/lobby", () => ({
  addPick: vi.fn(() => Promise.resolve()),
  removePick: vi.fn(() => Promise.resolve()),
  setStage: vi.fn(() => Promise.resolve()),
}));

vi.mock("../lib/tmdb", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../lib/tmdb")>()),
  searchMovies: vi.fn(),
}));

const RESULTS = [
  { id: "348", title: "Alien", year: "1979" },
  { id: "603", title: "The Matrix", year: "1999" },
  { id: "949", title: "Heat", year: "1995" },
];

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(searchMovies).mockResolvedValue(RESULTS);
});

function lobby(overrides: Partial<Lobby> = {}): Lobby {
  return {
    hostId: "host",
    createdAt: 1,
    settings: { numMovies: 2, unlimitedVotes: false },
    stage: "PICKING",
    members: { host: 1, me: 1 },
    ...overrides,
  };
}

async function search(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByRole("searchbox", { name: "Movie title" }), "a{Enter}");
  await screen.findByRole("button", { name: /Heat/ });
}

describe("PickingStage", () => {
  it("searches on Enter and adds a pick", async () => {
    const user = userEvent.setup();
    render(<PickingStage code="ABC234" lobby={lobby()} uid="me" canAct />);
    await search(user);
    await user.click(screen.getByRole("button", { name: /Alien/ }));
    expect(addPick).toHaveBeenCalledWith("ABC234", "me", RESULTS[0]);
  });

  it("stops at the per-person limit and explains why", async () => {
    const user = userEvent.setup();
    const picks = { me: { "348": { title: "Alien" }, "603": { title: "The Matrix" } } };
    render(<PickingStage code="ABC234" lobby={lobby({ picks })} uid="me" canAct />);
    await search(user);
    await user.click(screen.getByRole("button", { name: /Heat/ }));
    expect(addPick).not.toHaveBeenCalled();
    expect(await screen.findByText(/only pick 2 movies/)).toBeInTheDocument();
  });

  it("removes a pick when a selected movie is clicked again", async () => {
    const user = userEvent.setup();
    const picks = { me: { "348": { title: "Alien" } } };
    render(<PickingStage code="ABC234" lobby={lobby({ picks })} uid="me" canAct />);
    await search(user);
    await user.click(screen.getByRole("button", { name: /Alien \(1979\)/ }));
    expect(removePick).toHaveBeenCalledWith("ABC234", "me", "348");
  });

  it("shows a search error instead of crashing", async () => {
    vi.mocked(searchMovies).mockRejectedValue(new Error("Movie search failed (500)."));
    const user = userEvent.setup();
    render(<PickingStage code="ABC234" lobby={lobby()} uid="me" canAct />);
    await user.type(screen.getByRole("searchbox", { name: "Movie title" }), "a{Enter}");
    expect(await screen.findByRole("alert")).toHaveTextContent("Movie search failed (500).");
  });

  it("only lets the host start voting, and only with at least two movies", async () => {
    const user = userEvent.setup();
    const onePick = { host: { "348": { title: "Alien" } } };
    const { rerender } = render(<PickingStage code="ABC234" lobby={lobby({ picks: onePick })} uid="host" canAct />);
    expect(screen.getByRole("button", { name: "Start voting" })).toBeDisabled();

    const twoPicks = { host: { "348": { title: "Alien" } }, me: { "603": { title: "The Matrix" } } };
    rerender(<PickingStage code="ABC234" lobby={lobby({ picks: twoPicks })} uid="host" canAct />);
    await user.click(screen.getByRole("button", { name: "Start voting" }));
    expect(setStage).toHaveBeenCalledWith("ABC234", "VOTING");

    rerender(<PickingStage code="ABC234" lobby={lobby({ picks: twoPicks })} uid="me" canAct />);
    expect(screen.queryByRole("button", { name: "Start voting" })).not.toBeInTheDocument();
  });
});
