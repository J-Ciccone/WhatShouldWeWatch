import { useState } from "react";
import { Button, ListGroup } from "react-bootstrap";
import { moviePool } from "../lib/tally";
import { MIN_MOVIES_TO_VOTE, type Lobby, type Movie } from "../lib/types";
import { addPick, removePick, setStage } from "../services/lobby";
import { MovieSearch } from "./MovieSearch";
import { Notice } from "./Notice";

interface Props {
  code: string;
  lobby: Lobby;
  uid: string;
  /** False until this user has joined the lobby. */
  canAct: boolean;
}

export function PickingStage({ code, lobby, uid, canAct }: Props) {
  const [notice, setNotice] = useState<string | null>(null);
  // Movie ids with a pick write still in flight, so fast clicks can't overshoot the limit.
  const [pendingAdds, setPendingAdds] = useState<ReadonlySet<string>>(new Set());

  const myPicks = lobby.picks?.[uid] ?? {};
  const myPickIds = Object.keys(myPicks);
  const limit = lobby.settings.numMovies;
  const used = myPickIds.length + [...pendingAdds].filter((id) => !(id in myPicks)).length;
  const pool = moviePool(lobby);
  const isHost = lobby.hostId === uid;

  const toggle = async (movie: Movie) => {
    if (movie.id in myPicks) {
      await removePick(code, uid, movie.id).catch(() => setNotice("Couldn't remove that pick. Try again."));
      return;
    }
    if (pendingAdds.has(movie.id)) return;
    if (used >= limit) {
      setNotice(`You can only pick ${limit} movies. Remove one first!`);
      return;
    }
    setPendingAdds((s) => new Set(s).add(movie.id));
    try {
      await addPick(code, uid, movie);
    } catch {
      setNotice("Couldn't save that pick. Try again.");
    } finally {
      setPendingAdds((s) => {
        const next = new Set(s);
        next.delete(movie.id);
        return next;
      });
    }
  };

  const startVoting = () =>
    setStage(code, "VOTING").catch(() => setNotice("Couldn't start voting. Try again."));

  return (
    <div className="row g-4">
      <div className="col-lg-8">
        <div className="panel">
          <h3>Pick your movies</h3>
          <p className="text-muted mb-3">Choose up to {limit}. Everyone's picks go into the vote.</p>
          <MovieSearch isSelected={(id) => id in myPicks} onToggle={toggle} disabled={!canAct} />
        </div>
      </div>

      <aside className="col-lg-4 order-first order-lg-last">
        <div className="panel pick-sidebar">
          <h4>
            Your picks{" "}
            <small className="text-muted">
              ({myPickIds.length}/{limit})
            </small>
          </h4>
          <ListGroup variant="flush" className="mb-3">
            {myPickIds.length === 0 && <ListGroup.Item className="pick-item">Your picks will appear here.</ListGroup.Item>}
            {myPickIds.map((id) => {
              const movie = myPicks[id]!;
              return (
                <ListGroup.Item key={id} className="pick-item">
                  <span>
                    <strong>{movie.title}</strong> {movie.year && <em>({movie.year})</em>}
                  </span>
                  <Button size="sm" variant="danger" onClick={() => toggle({ ...movie, id })}>
                    Remove
                  </Button>
                </ListGroup.Item>
              );
            })}
          </ListGroup>

          <p className="mb-2">
            {pool.length} {pool.length === 1 ? "movie" : "movies"} picked so far.
          </p>
          {isHost ? (
            <>
              <Button className="w-100" onClick={startVoting} disabled={pool.length < MIN_MOVIES_TO_VOTE}>
                Start voting
              </Button>
              {pool.length < MIN_MOVIES_TO_VOTE && (
                <small className="text-muted d-block mt-2">
                  You need at least {MIN_MOVIES_TO_VOTE} movies to start the vote.
                </small>
              )}
            </>
          ) : (
            <small className="text-muted">Waiting for the host to start the vote…</small>
          )}
        </div>
      </aside>
      <Notice message={notice} onClose={() => setNotice(null)} />
    </div>
  );
}
