import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useLobby, type LobbyState } from "../hooks/useLobby";
import { recentLobbies, rememberLobby } from "../lib/recentLobbies";
import type { Lobby } from "../lib/types";
import { joinLobby, renameMember } from "../services/lobby";
import { renderWithApp } from "../test/render";
import { LobbyPage } from "./LobbyPage";

vi.mock("../hooks/useLobby", () => ({ useLobby: vi.fn() }));

vi.mock("../services/lobby", () => ({
  joinLobby: vi.fn(() => Promise.resolve()),
  renameMember: vi.fn(() => Promise.resolve()),
  addPick: vi.fn(() => Promise.resolve()),
  removePick: vi.fn(() => Promise.resolve()),
  setStage: vi.fn(() => Promise.resolve()),
  setSingleVote: vi.fn(() => Promise.resolve()),
  setMultiVote: vi.fn(() => Promise.resolve()),
  setTiebreak: vi.fn(() => Promise.resolve()),
  startNextRound: vi.fn(() => Promise.resolve("NEXT23")),
}));

vi.mock("../hooks/useTmdb", () => ({
  useTrending: () => ({ status: "ready", data: [] }),
  useMovieExtras: () => ({ status: "loading" }),
}));

beforeEach(() => vi.clearAllMocks());
afterEach(() => localStorage.clear());

function lobby(overrides: Partial<Lobby> = {}): Lobby {
  return {
    hostId: "host",
    createdAt: 1,
    settings: { numMovies: 2, unlimitedVotes: false },
    stage: "PICKING",
    members: { host: { name: "Hana", joinedAt: 1 } },
    ...overrides,
  };
}

function withLobby(state: LobbyState) {
  vi.mocked(useLobby).mockReturnValue(state);
}

const view = (route = "/lobby/ABC234") => renderWithApp(<LobbyPage />, { route, path: "/lobby/:code" });

describe("LobbyPage", () => {
  it("asks first-timers for a name, then joins with it", async () => {
    const user = userEvent.setup();
    withLobby({ status: "ready", lobby: lobby() });
    view();
    expect(await screen.findByRole("heading", { name: "Join the movie night" })).toBeInTheDocument();
    expect(joinLobby).not.toHaveBeenCalled();

    await user.type(screen.getByLabelText("Your name"), "  Max  ");
    await user.click(screen.getByRole("button", { name: "Join" }));
    expect(joinLobby).toHaveBeenCalledWith("ABC234", "me", "Max");
    expect(localStorage.getItem("wsww:name")).toBe("Max");
  });

  it("treats Esc or Android back on the join prompt as 'not now'", () => {
    // Regression: re-opening the prompt on a native close trapped the Android back gesture.
    withLobby({ status: "ready", lobby: lobby() });
    view();
    const dialog = document.querySelector<HTMLDialogElement>("dialog[open]")!;
    expect(dialog).toHaveTextContent("Join the movie night");
    dialog.close();
    fireEvent(dialog, new Event("close"));
    expect(screen.getByTestId("location")).toHaveTextContent(/^\/$/);
    // Replaced, not pushed, so another back press leaves instead of bouncing back to the lobby.
    expect(screen.getByTestId("nav-type")).toHaveTextContent("REPLACE");
    expect(joinLobby).not.toHaveBeenCalled();
  });

  it("joins returning players straight away with their saved name", () => {
    localStorage.setItem("wsww:name", "Max");
    withLobby({ status: "ready", lobby: lobby() });
    view();
    expect(joinLobby).toHaveBeenCalledTimes(1);
    expect(joinLobby).toHaveBeenCalledWith("ABC234", "me", "Max");
    expect(screen.queryByRole("heading", { name: "Join the movie night" })).not.toBeInTheDocument();
  });

  it("doesn't join a vote that's already over", () => {
    localStorage.setItem("wsww:name", "Max");
    withLobby({ status: "ready", lobby: lobby({ stage: "DONE" }) });
    view();
    expect(joinLobby).not.toHaveBeenCalled();
  });

  it("lets players rename themselves", async () => {
    const user = userEvent.setup();
    localStorage.setItem("wsww:name", "Max");
    withLobby({
      status: "ready",
      lobby: lobby({ members: { host: { name: "Hana", joinedAt: 1 }, me: { name: "Max", joinedAt: 7 } } }),
    });
    view();
    await user.click(screen.getByRole("button", { name: /Change your name/ }));
    const input = screen.getByLabelText("Your name");
    await user.clear(input);
    await user.type(input, "Maxine");
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(renameMember).toHaveBeenCalledWith("ABC234", "me", "Maxine", 7);
  });

  it("nudges a lonely host to invite people", () => {
    withLobby({ status: "ready", lobby: lobby() });
    renderWithApp(<LobbyPage />, { route: "/lobby/ABC234", path: "/lobby/:code", uid: "host" });
    expect(screen.getByText(/It's just you so far/)).toBeInTheDocument();
  });

  it("remembers lobbies you visit and forgets ones that are gone", () => {
    withLobby({ status: "ready", lobby: lobby() });
    const { unmount } = view();
    expect(recentLobbies()).toEqual(["ABC234"]);
    unmount();

    rememberLobby("ZZZZZZ");
    withLobby({ status: "missing" });
    view("/lobby/ZZZZZZ");
    expect(screen.getByRole("heading", { name: "Lobby not found" })).toBeInTheDocument();
    expect(recentLobbies()).toEqual(["ABC234"]);
  });

  it("plays the random-pick reveal for people watching, but not after a reload", () => {
    localStorage.setItem("wsww:name", "Max");
    const members = { host: { name: "Hana", joinedAt: 1 }, me: { name: "Max", joinedAt: 2 } };
    const picks = { host: { "348": { title: "Alien" } }, me: { "603": { title: "The Matrix" } } };
    const done = lobby({ stage: "DONE", members, picks, randomPick: { movieId: "603", pickedBy: "me" } });

    withLobby({ status: "ready", lobby: lobby({ members, picks }) });
    const { rerender, unmount } = view();
    withLobby({ status: "ready", lobby: done });
    rerender(<LobbyPage />);
    expect(screen.getByRole("heading", { name: "Picking at random…" })).toBeInTheDocument();
    unmount();

    view();
    expect(screen.queryByRole("heading", { name: "Picking at random…" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "The Matrix" })).toBeInTheDocument();
  });

  it("cleans up a lowercase or dashed code in the address", () => {
    withLobby({ status: "loading" });
    view("/lobby/abc-234");
    expect(screen.getByTestId("location")).toHaveTextContent("/lobby/ABC234");
  });
});
