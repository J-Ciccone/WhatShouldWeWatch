import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Lobby } from "../lib/types";
import { setMultiVote, setSingleVote, setStage } from "../services/lobby";
import { renderWithApp } from "../test/render";
import { VotingStage } from "./VotingStage";

vi.mock("../services/lobby", () => ({
  setSingleVote: vi.fn(() => Promise.resolve()),
  setMultiVote: vi.fn(() => Promise.resolve()),
  setStage: vi.fn(() => Promise.resolve()),
}));

vi.mock("../hooks/useTmdb", () => ({
  useTrending: () => ({ status: "loading" }),
  useMovieExtras: () => ({ status: "loading" }),
}));

beforeEach(() => vi.clearAllMocks());

function lobby(overrides: Partial<Lobby> = {}): Lobby {
  return {
    hostId: "host",
    createdAt: 1,
    settings: { numMovies: 2, unlimitedVotes: false },
    stage: "VOTING",
    members: { host: { name: "Hana", joinedAt: 1 }, me: { name: "Max", joinedAt: 2 } },
    picks: { host: { "348": { title: "Alien" } }, me: { "603": { title: "The Matrix" } } },
    ...overrides,
  };
}

const card = (name: string) => screen.getByRole("button", { name });
const view = (l: Lobby, uid = "me", canAct = true) =>
  renderWithApp(<VotingStage code="ABC234" lobby={l} uid={uid} canAct={canAct} />);

describe("VotingStage, single vote", () => {
  it("can vote again after withdrawing a vote", async () => {
    // Regression: the old VoteCard replaced its state with `true` on un-vote, which blocked all later votes.
    const user = userEvent.setup();
    const first = view(lobby());
    await user.click(card("Alien"));
    expect(setSingleVote).toHaveBeenLastCalledWith("ABC234", "me", "348");
    first.unmount();

    const voted = view(lobby({ votes: { me: "348" } }));
    expect(card("Alien")).toHaveAttribute("aria-pressed", "true");
    await user.click(card("Alien"));
    expect(setSingleVote).toHaveBeenLastCalledWith("ABC234", "me", null);
    voted.unmount();

    view(lobby());
    await user.click(card("The Matrix"));
    expect(setSingleVote).toHaveBeenLastCalledWith("ABC234", "me", "603");
  });

  it("moves the vote when another movie is tapped", async () => {
    const user = userEvent.setup();
    view(lobby({ votes: { me: "348" } }));
    await user.click(card("The Matrix"));
    expect(setSingleVote).toHaveBeenLastCalledWith("ABC234", "me", "603");
  });
});

describe("VotingStage, unlimited votes", () => {
  it("toggles each movie independently", async () => {
    const user = userEvent.setup();
    const settings = { numMovies: 2, unlimitedVotes: true };
    view(lobby({ settings, votes: { me: { "348": true } } }));
    await user.click(card("The Matrix"));
    expect(setMultiVote).toHaveBeenLastCalledWith("ABC234", "me", "603", true);
    await user.click(card("Alien"));
    expect(setMultiVote).toHaveBeenLastCalledWith("ABC234", "me", "348", false);
  });
});

describe("VotingStage, status and host controls", () => {
  it("shows the reveal button only to the host", async () => {
    const user = userEvent.setup();
    const guest = view(lobby());
    expect(screen.queryByRole("button", { name: /Reveal winner/ })).not.toBeInTheDocument();
    guest.unmount();

    view(lobby(), "host");
    await user.click(screen.getByRole("button", { name: /Reveal winner/ }));
    expect(setStage).toHaveBeenCalledWith("ABC234", "DONE");
  });

  it("shows who has voted", () => {
    view(lobby({ votes: { host: "348" } }));
    expect(screen.getByText("1 of 2 voted")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Hana" })).toBeInTheDocument();
  });

  it("says when everyone is in", () => {
    view(lobby({ votes: { host: "348", me: "603" } }));
    expect(screen.getByText("Everyone's in!")).toBeInTheDocument();
  });

  it("disables voting until the user has joined", () => {
    view(lobby(), "me", false);
    expect(card("Alien")).toBeDisabled();
  });
});
