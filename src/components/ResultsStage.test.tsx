import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Lobby } from "../lib/types";
import { setTiebreak, startNextRound } from "../services/lobby";
import { renderWithApp } from "../test/render";
import { ResultsStage } from "./ResultsStage";

vi.mock("../services/lobby", () => ({
  setTiebreak: vi.fn(() => Promise.resolve()),
  startNextRound: vi.fn(() => Promise.resolve("NEXT23")),
}));

vi.mock("../hooks/useTmdb", () => ({
  useTrending: () => ({ status: "loading" }),
  useMovieExtras: () => ({ status: "loading" }),
}));

beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.useRealTimers());

function lobby(overrides: Partial<Lobby> = {}): Lobby {
  return {
    hostId: "host",
    createdAt: 1,
    settings: { numMovies: 2, unlimitedVotes: false },
    stage: "DONE",
    members: { host: { name: "Hana", joinedAt: 1 }, me: { name: "Max", joinedAt: 2 } },
    picks: {
      host: { "348": { title: "Alien", overview: "In space…" } },
      me: { "603": { title: "The Matrix" } },
    },
    ...overrides,
  };
}

const view = (l: Lobby, uid = "me") =>
  renderWithApp(<ResultsStage code="ABC234" lobby={l} uid={uid} />, { route: "/lobby/ABC234" });

describe("ResultsStage", () => {
  it("celebrates a clear winner", () => {
    view(lobby({ votes: { host: "348", me: "348" } }));
    expect(screen.getByText("Tonight we're watching")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Alien" })).toBeInTheDocument();
    expect(screen.getByText("In space…")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Vote results" })).toHaveTextContent(/Alien\s*2/);
  });

  it("lets the host break a tie at random, and tells guests to wait", async () => {
    const user = userEvent.setup();
    const tied = lobby({ votes: { host: "348", me: "603" } });
    const guest = view(tied);
    expect(screen.getByRole("heading", { name: "It's a 2-way tie!" })).toBeInTheDocument();
    expect(screen.getByText(/Waiting for the host/)).toBeInTheDocument();
    guest.unmount();

    view(tied, "host");
    await user.click(screen.getByRole("button", { name: /Let fate decide/ }));
    expect(setTiebreak).toHaveBeenCalledWith("ABC234", expect.stringMatching(/^(348|603)$/));
  });

  it("shows the tie-break winner straight away on reload", () => {
    view(lobby({ votes: { host: "348", me: "603" }, tiebreak: "603" }));
    expect(screen.getByText(/Fate has spoken/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "The Matrix" })).toBeInTheDocument();
  });

  it("plays the shuffle for people watching when the tie is broken", () => {
    vi.useFakeTimers();
    const tied = lobby({ votes: { host: "348", me: "603" } });
    const { rerender } = view(tied);
    rerender(<ResultsStage code="ABC234" lobby={{ ...tied, tiebreak: "348" }} uid="me" />);
    expect(screen.getByRole("heading", { name: "Let fate decide…" })).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(5000));
    expect(screen.getByRole("heading", { name: "Alien" })).toBeInTheDocument();
  });

  it("handles a vote nobody took part in", () => {
    view(lobby());
    expect(screen.getByRole("heading", { name: "Nobody voted!" })).toBeInTheDocument();
  });

  it("lets the host start another round with the same group", async () => {
    const user = userEvent.setup();
    view(lobby({ votes: { host: "348" } }), "host");
    await user.click(screen.getByRole("button", { name: /Play again/ }));
    expect(startNextRound).toHaveBeenCalledWith("ABC234", "host", { numMovies: 2, unlimitedVotes: false }, "Hana");
    expect(screen.getByTestId("location")).toHaveTextContent("/lobby/NEXT23");
  });

  it("offers guests a one-tap jump to the next round", () => {
    view(lobby({ votes: { host: "348" }, nextLobby: "NEXT23" }));
    expect(screen.getByText(/Hana started another round/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Join next round" })).toHaveAttribute("href", "/lobby/NEXT23");
  });
});
