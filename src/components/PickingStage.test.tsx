import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { searchMovies } from "../lib/tmdb";
import type { Lobby } from "../lib/types";
import { addPick, removePick, setStage } from "../services/lobby";
import { renderWithApp } from "../test/render";
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

const TRENDING = [{ id: "1100", title: "Big Hit", year: "2026", rating: 7.9 }];

vi.mock("../hooks/useTmdb", () => ({
  useTrending: () => ({ status: "ready", data: TRENDING }),
  useMovieExtras: () => ({ status: "loading" }),
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
    members: { host: { name: "Hana", joinedAt: 1 }, me: { name: "Max", joinedAt: 2 } },
    ...overrides,
  };
}

const view = (l: Lobby, uid = "me") => renderWithApp(<PickingStage code="ABC234" lobby={l} uid={uid} canAct />);

async function search(user: ReturnType<typeof userEvent.setup>, text = "a") {
  await user.type(screen.getByRole("searchbox", { name: "Movie title" }), `${text}{Enter}`);
  await screen.findByRole("button", { name: "Heat (1995)" });
}

describe("PickingStage", () => {
  it("shows popular movies before you search, and lets you pick one", async () => {
    const user = userEvent.setup();
    view(lobby());
    expect(screen.getByRole("heading", { name: "Popular this week" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Big Hit (2026)" }));
    expect(addPick).toHaveBeenCalledWith("ABC234", "me", TRENDING[0]);
  });

  it("searches as you type, without needing Enter", async () => {
    const user = userEvent.setup();
    view(lobby());
    await user.type(screen.getByRole("searchbox", { name: "Movie title" }), "heat");
    expect(await screen.findByRole("button", { name: "Heat (1995)" }, { timeout: 2000 })).toBeInTheDocument();
    expect(searchMovies).toHaveBeenLastCalledWith("heat", expect.anything());
  });

  it("stops at the per-person limit and explains why", async () => {
    const user = userEvent.setup();
    const picks = { me: { "348": { title: "Alien" }, "603": { title: "The Matrix" } } };
    view(lobby({ picks }));
    await search(user);
    await user.click(screen.getByRole("button", { name: "Heat (1995)" }));
    expect(addPick).not.toHaveBeenCalled();
    expect(await screen.findByText(/picked 2 already/)).toBeInTheDocument();
  });

  it("removes a pick from the tray at the bottom", async () => {
    const user = userEvent.setup();
    view(lobby({ picks: { me: { "348": { title: "Alien" } } } }));
    const tray = screen.getByLabelText("Your picks");
    expect(within(tray).getByText("1/2")).toBeInTheDocument();
    await user.click(within(tray).getByRole("button", { name: "Remove Alien" }));
    expect(removePick).toHaveBeenCalledWith("ABC234", "me", "348");
  });

  it("shows the group's picks with who picked them, and lets you pick one too", async () => {
    const user = userEvent.setup();
    view(lobby({ picks: { host: { "348": { title: "Alien", year: "1979" } } } }));
    const group = screen.getByRole("region", { name: "The group's picks" });
    expect(within(group).getByRole("img", { name: "Hana" })).toBeInTheDocument();
    await user.click(within(group).getByRole("button", { name: "Alien (1979)" }));
    expect(addPick).toHaveBeenCalledWith("ABC234", "me", { id: "348", title: "Alien", year: "1979" });
  });

  it("shows a search error instead of crashing", async () => {
    vi.mocked(searchMovies).mockRejectedValue(new Error("Movie search failed (500)."));
    const user = userEvent.setup();
    view(lobby());
    await user.type(screen.getByRole("searchbox", { name: "Movie title" }), "a{Enter}");
    expect(await screen.findByRole("alert")).toHaveTextContent("Movie search failed (500).");
  });

  it("only lets the host start voting, and only with at least two movies", async () => {
    const user = userEvent.setup();
    const { unmount } = view(lobby({ picks: { host: { "348": { title: "Alien" } } } }), "host");
    expect(screen.getByRole("button", { name: /Need 2\+ movies/ })).toBeDisabled();
    unmount();

    const twoPicks = { host: { "348": { title: "Alien" } }, me: { "603": { title: "The Matrix" } } };
    const second = view(lobby({ picks: twoPicks }), "host");
    await user.click(screen.getByRole("button", { name: /Start voting/ }));
    expect(setStage).toHaveBeenCalledWith("ABC234", "VOTING");
    second.unmount();

    view(lobby({ picks: twoPicks }), "me");
    expect(screen.queryByRole("button", { name: /Start voting/ })).not.toBeInTheDocument();
    expect(screen.getByText("The host starts the vote")).toBeInTheDocument();
  });

  it("tells the host when everyone has finished picking", () => {
    const picks = {
      host: { "1": { title: "A" }, "2": { title: "B" } },
      me: { "3": { title: "C" }, "4": { title: "D" } },
    };
    view(lobby({ picks }), "host");
    expect(screen.getByRole("button", { name: /Everyone's in/ })).toBeEnabled();
  });
});
