import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Lobby } from "../lib/types";
import { setMultiVote, setSingleVote, setStage } from "../services/lobby";
import { VotingStage } from "./VotingStage";

vi.mock("../services/lobby", () => ({
  setSingleVote: vi.fn(() => Promise.resolve()),
  setMultiVote: vi.fn(() => Promise.resolve()),
  setStage: vi.fn(() => Promise.resolve()),
}));

beforeEach(() => vi.clearAllMocks());

function lobby(overrides: Partial<Lobby> = {}): Lobby {
  return {
    hostId: "host",
    createdAt: 1,
    settings: { numMovies: 2, unlimitedVotes: false },
    stage: "VOTING",
    members: { host: 1, me: 1 },
    picks: { host: { "348": { title: "Alien" } }, me: { "603": { title: "The Matrix" } } },
    ...overrides,
  };
}

const card = (name: RegExp) => screen.getByRole("button", { name });

describe("VotingStage, single vote", () => {
  it("can vote again after withdrawing a vote", async () => {
    // Regression: the old VoteCard replaced its state with `true` on un-vote, which blocked all later votes.
    const user = userEvent.setup();
    const { rerender } = render(<VotingStage code="ABC234" lobby={lobby()} uid="me" canAct />);

    await user.click(card(/Alien/));
    expect(setSingleVote).toHaveBeenLastCalledWith("ABC234", "me", "348");

    rerender(<VotingStage code="ABC234" lobby={lobby({ votes: { me: "348" } })} uid="me" canAct />);
    expect(card(/Alien/)).toHaveAttribute("aria-pressed", "true");
    await user.click(card(/Alien/));
    expect(setSingleVote).toHaveBeenLastCalledWith("ABC234", "me", null);

    rerender(<VotingStage code="ABC234" lobby={lobby()} uid="me" canAct />);
    await user.click(card(/Matrix/));
    expect(setSingleVote).toHaveBeenLastCalledWith("ABC234", "me", "603");
  });

  it("moves the vote when another movie is clicked", async () => {
    const user = userEvent.setup();
    render(<VotingStage code="ABC234" lobby={lobby({ votes: { me: "348" } })} uid="me" canAct />);
    await user.click(card(/Matrix/));
    expect(setSingleVote).toHaveBeenLastCalledWith("ABC234", "me", "603");
  });
});

describe("VotingStage, unlimited votes", () => {
  it("toggles each movie independently", async () => {
    const user = userEvent.setup();
    const settings = { numMovies: 2, unlimitedVotes: true };
    render(
      <VotingStage code="ABC234" lobby={lobby({ settings, votes: { me: { "348": true } } })} uid="me" canAct />,
    );
    await user.click(card(/Matrix/));
    expect(setMultiVote).toHaveBeenLastCalledWith("ABC234", "me", "603", true);
    await user.click(card(/Alien/));
    expect(setMultiVote).toHaveBeenLastCalledWith("ABC234", "me", "348", false);
  });
});

describe("VotingStage, host controls", () => {
  it("shows End vote only to the host", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<VotingStage code="ABC234" lobby={lobby()} uid="me" canAct />);
    expect(screen.queryByRole("button", { name: "End vote" })).not.toBeInTheDocument();

    rerender(<VotingStage code="ABC234" lobby={lobby()} uid="host" canAct />);
    await user.click(screen.getByRole("button", { name: "End vote" }));
    expect(setStage).toHaveBeenCalledWith("ABC234", "DONE");
  });

  it("shows how many players have voted", () => {
    render(<VotingStage code="ABC234" lobby={lobby({ votes: { host: "348" } })} uid="me" canAct />);
    expect(screen.getByText(/of 2 players have voted/)).toHaveTextContent("1 of 2 players have voted");
  });

  it("disables voting until the user has joined", () => {
    render(<VotingStage code="ABC234" lobby={lobby()} uid="me" canAct={false} />);
    expect(card(/Alien/)).toBeDisabled();
  });
});
