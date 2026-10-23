import { PartyPopper } from "lucide-react";
import { useState } from "react";
import { playersOf } from "../lib/players";
import { moviePool, votesOf } from "../lib/tally";
import type { Lobby, Movie } from "../lib/types";
import { setMultiVote, setSingleVote, setStage } from "../services/lobby";
import { MovieCard } from "./MovieCard";
import { MovieDetailsDialog } from "./MovieDetailsDialog";
import { ActionBar } from "./ui/ActionBar";
import { AvatarStack } from "./ui/Avatar";
import { useToast } from "./ui/toastContext";

interface Props {
  code: string;
  lobby: Lobby;
  uid: string;
  /** False until this user has joined the lobby. */
  canAct: boolean;
}

export function VotingStage({ code, lobby, uid, canAct }: Props) {
  const toast = useToast();
  const [details, setDetails] = useState<Movie | null>(null);
  const pool = moviePool(lobby);
  const myVotes = new Set(votesOf(lobby, uid));
  const unlimited = lobby.settings.unlimitedVotes;
  const isHost = lobby.hostId === uid;
  const players = playersOf(lobby);
  const voted = players.filter((p) => votesOf(lobby, p.uid).length > 0);
  const everyoneVoted = players.length > 0 && voted.length === players.length;

  const toggle = (movieId: string) => {
    const isVoted = myVotes.has(movieId);
    // Single-vote lobbies: tapping another movie moves your vote; tapping yours withdraws it.
    const write = unlimited
      ? setMultiVote(code, uid, movieId, !isVoted)
      : setSingleVote(code, uid, isVoted ? null : movieId);
    write.catch(() => toast("Couldn't save your vote. Try again.", "error"));
  };

  const reveal = () => setStage(code, "DONE").catch(() => toast("Couldn't end the vote. Try again.", "error"));

  return (
    <>
      <p className="muted">
        {unlimited
          ? "Vote for every movie you'd be happy with. Most votes wins."
          : "Tap the one you want most. Tap another to change your mind."}{" "}
        Results appear when the host reveals the winner.
      </p>

      <div className="movie-grid section">
        {pool.map(({ movie }) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            selected={myVotes.has(movie.id)}
            actionLabel="Vote"
            selectedLabel={unlimited ? "Voted" : "Your vote"}
            onToggle={() => toggle(movie.id)}
            onInfo={() => setDetails(movie)}
            disabled={!canAct}
          />
        ))}
      </div>

      <MovieDetailsDialog
        movie={details}
        onClose={() => setDetails(null)}
        action={
          details
            ? {
                label: "Vote for this",
                selectedLabel: unlimited ? "Voted" : "Your vote",
                selected: myVotes.has(details.id),
                onToggle: () => toggle(details.id),
                disabled: !canAct,
              }
            : undefined
        }
      />

      <ActionBar>
        <div className="action-bar-status">
          {voted.length > 0 && <AvatarStack players={voted} max={5} />}
          <div>
            <strong>
              {voted.length} of {players.length} voted
            </strong>
            <span className="muted small">
              {everyoneVoted
                ? "Everyone's in!"
                : myVotes.size > 0
                  ? "Your vote is in."
                  : "Tap a movie to vote."}
            </span>
          </div>
        </div>
        {isHost ? (
          <button type="button" className="btn btn-primary" onClick={reveal}>
            <PartyPopper size={18} /> Reveal winner
          </button>
        ) : (
          <span className="muted small" style={{ textAlign: "right" }}>
            The host reveals the winner
          </span>
        )}
      </ActionBar>
    </>
  );
}
