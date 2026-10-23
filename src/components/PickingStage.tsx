import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { isPlayerDone, playersOf } from "../lib/players";
import { moviePool } from "../lib/tally";
import { MIN_MOVIES_TO_VOTE, type Lobby, type Movie } from "../lib/types";
import { addPick, removePick, setStage } from "../services/lobby";
import { MovieCard } from "./MovieCard";
import { MovieDetailsDialog } from "./MovieDetailsDialog";
import { MovieSearch } from "./MovieSearch";
import { PicksTray } from "./PicksTray";
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

export function PickingStage({ code, lobby, uid, canAct }: Props) {
  const toast = useToast();
  // Movie ids with a pick write still in flight, so fast taps can't overshoot the limit.
  const [pendingAdds, setPendingAdds] = useState<ReadonlySet<string>>(new Set());
  const [details, setDetails] = useState<Movie | null>(null);

  const myPicks = lobby.picks?.[uid] ?? {};
  const limit = lobby.settings.numMovies;
  const used = Object.keys(myPicks).length + [...pendingAdds].filter((id) => !(id in myPicks)).length;
  const pool = moviePool(lobby);
  const players = playersOf(lobby);
  const isHost = lobby.hostId === uid;
  const everyoneDone = players.length > 1 && players.every((p) => isPlayerDone(lobby, p.uid));
  const enoughMovies = pool.length >= MIN_MOVIES_TO_VOTE;

  const toggle = async (movie: Movie) => {
    if (movie.id in myPicks) {
      await removePick(code, uid, movie.id).catch(() => toast("Couldn't remove that pick. Try again.", "error"));
      return;
    }
    if (pendingAdds.has(movie.id)) return;
    if (used >= limit) {
      toast(`You've picked ${limit} already. Remove one to swap it out.`);
      return;
    }
    setPendingAdds((s) => new Set(s).add(movie.id));
    try {
      await addPick(code, uid, movie);
    } catch {
      toast("Couldn't save that pick. Try again.", "error");
    } finally {
      setPendingAdds((s) => {
        const next = new Set(s);
        next.delete(movie.id);
        return next;
      });
    }
  };

  const startVoting = () => setStage(code, "VOTING").catch(() => toast("Couldn't start voting. Try again.", "error"));

  return (
    <>
      <p className="muted">
        Pick up to <strong>{limit}</strong> movies you'd be happy to watch. Everyone's picks go into the vote.
      </p>

      {pool.length > 0 && (
        <section className="section" aria-label="The group's picks">
          <div className="section-head">
            <h3>The group's picks</h3>
            <span className="muted small">
              {pool.length} {pool.length === 1 ? "movie" : "movies"}
            </span>
          </div>
          <div className="movie-grid">
            {pool.map(({ movie, pickedBy }) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                selected={movie.id in myPicks}
                actionLabel="Pick too"
                selectedLabel="Picked"
                onToggle={() => toggle(movie)}
                onInfo={() => setDetails(movie)}
                disabled={!canAct}
                footer={<AvatarStack players={players.filter((p) => pickedBy.includes(p.uid))} />}
              />
            ))}
          </div>
        </section>
      )}

      <div className="section">
        <MovieSearch
          isSelected={(id) => id in myPicks}
          onToggle={toggle}
          onInfo={setDetails}
          disabled={!canAct}
        />
      </div>

      <MovieDetailsDialog
        movie={details}
        onClose={() => setDetails(null)}
        action={
          details
            ? {
                label: "Pick this",
                selectedLabel: "Picked",
                selected: details.id in myPicks,
                onToggle: () => toggle(details),
                disabled: !canAct,
              }
            : undefined
        }
      />

      <ActionBar>
        <div className="action-bar-status">
          <PicksTray picks={myPicks} limit={limit} onRemove={(id) => toggle({ ...myPicks[id]!, id })} />
        </div>
        {isHost ? (
          <button type="button" className="btn btn-primary" onClick={startVoting} disabled={!enoughMovies}>
            {enoughMovies ? (everyoneDone ? "Everyone's in! Vote" : "Start voting") : `Need ${MIN_MOVIES_TO_VOTE}+ movies`}
            {enoughMovies && <ChevronRight size={18} />}
          </button>
        ) : (
          <span className="muted small" style={{ textAlign: "right" }}>
            The host starts the vote
          </span>
        )}
      </ActionBar>
    </>
  );
}
