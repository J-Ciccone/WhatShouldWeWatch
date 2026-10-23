import { useState } from "react";
import { Button } from "react-bootstrap";
import { moviePool, voterCount, votesOf } from "../lib/tally";
import type { Lobby } from "../lib/types";
import { setMultiVote, setSingleVote, setStage } from "../services/lobby";
import { MovieCard } from "./MovieCard";
import { Notice } from "./Notice";

interface Props {
  code: string;
  lobby: Lobby;
  uid: string;
  /** False until this user has joined the lobby. */
  canAct: boolean;
}

export function VotingStage({ code, lobby, uid, canAct }: Props) {
  const [notice, setNotice] = useState<string | null>(null);
  const pool = moviePool(lobby);
  const myVotes = new Set(votesOf(lobby, uid));
  const unlimited = lobby.settings.unlimitedVotes;
  const isHost = lobby.hostId === uid;
  const players = Object.keys(lobby.members ?? {}).length;

  const toggle = (movieId: string) => {
    const voted = myVotes.has(movieId);
    // Single-vote lobbies: clicking another movie moves your vote; clicking yours withdraws it.
    const write = unlimited
      ? setMultiVote(code, uid, movieId, !voted)
      : setSingleVote(code, uid, voted ? null : movieId);
    write.catch(() => setNotice("Couldn't save your vote. Try again."));
  };

  const endVote = () => setStage(code, "DONE").catch(() => setNotice("Couldn't end the vote. Try again."));

  return (
    <div className="panel">
      <div className="vote-header">
        <div>
          <h3>Cast your vote!</h3>
          <p className="text-muted mb-0">
            {unlimited
              ? "Vote for as many movies as you like."
              : "Pick one movie. Tap a different one to change your vote."}
          </p>
        </div>
        <div className="vote-status">
          <div>
            <strong>{voterCount(lobby)}</strong> of {players} {players === 1 ? "player has" : "players have"} voted
          </div>
          {isHost && (
            <Button className="mt-2" onClick={endVote}>
              End vote
            </Button>
          )}
        </div>
      </div>
      <div className="movie-grid mt-4">
        {pool.map(({ movie }) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            selected={myVotes.has(movie.id)}
            actionLabel="Vote"
            onClick={() => toggle(movie.id)}
            disabled={!canAct}
          />
        ))}
      </div>
      <Notice message={notice} onClose={() => setNotice(null)} />
    </div>
  );
}
