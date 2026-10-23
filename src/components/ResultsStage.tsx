import { Dices, Home, RotateCcw, Star } from "lucide-react";
import { useEffect, useState, type CSSProperties } from "react";
import { Link, useNavigate } from "react-router";
import { playerName } from "../lib/players";
import { finalWinners, pickRandom, tally, winners, type TallyEntry } from "../lib/tally";
import { imageUrl } from "../lib/tmdb";
import type { Lobby } from "../lib/types";
import { setTiebreak, startNextRound } from "../services/lobby";
import { TrailerButton } from "./TrailerButton";
import { Confetti } from "./ui/Confetti";
import { useToast } from "./ui/toastContext";
import { WhereToWatch } from "./WhereToWatch";

interface Props {
  code: string;
  lobby: Lobby;
  uid: string;
}

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;
}

export function ResultsStage({ code, lobby, uid }: Props) {
  const toast = useToast();
  const navigate = useNavigate();
  const results = tally(lobby).sort((a, b) => b.votes - a.votes || a.movie.title.localeCompare(b.movie.title));
  const top = winners(lobby);
  const final = finalWinners(lobby);
  const isHost = lobby.hostId === uid;
  const nobodyVoted = results.length > 0 && top[0]!.votes === 0;

  // Only play the shuffle for people watching when the tie gets broken, not on reload.
  const [tiebreakAtMount] = useState(lobby.tiebreak);
  const [reducedMotion] = useState(prefersReducedMotion);
  const [shuffleDone, setShuffleDone] = useState(false);
  const shuffling = !tiebreakAtMount && Boolean(lobby.tiebreak) && top.length > 1 && !shuffleDone && !reducedMotion;
  const [starting, setStarting] = useState(false);

  const winner = !nobodyVoted && final.length === 1 && !shuffling ? final[0]! : null;
  const isTie = !nobodyVoted && final.length > 1;

  const breakTie = () =>
    setTiebreak(code, pickRandom(top).movie.id).catch(() => toast("Couldn't break the tie. Try again.", "error"));

  const playAgain = async () => {
    setStarting(true);
    try {
      const next = await startNextRound(code, uid, lobby.settings, playerName(lobby, uid));
      navigate(`/lobby/${next}`);
    } catch {
      toast("Couldn't start a new round. Try again.", "error");
      setStarting(false);
    }
  };

  return (
    <div>
      {lobby.nextLobby && !isHost && (
        <div className="banner">
          <p>🍿 {playerName(lobby, lobby.hostId)} started another round!</p>
          <Link to={`/lobby/${lobby.nextLobby}`} className="btn btn-primary">
            Join next round
          </Link>
        </div>
      )}

      {results.length === 0 && (
        <div className="centered">
          <h2>No movies were picked</h2>
          <p className="muted">Start a new vote and give it another go.</p>
        </div>
      )}

      {nobodyVoted && (
        <div className="card" style={{ textAlign: "center" }}>
          <h2>Nobody voted!</h2>
          <p className="muted" style={{ marginBottom: 0 }}>
            The vote ended before anyone picked a favourite.
          </p>
        </div>
      )}

      {shuffling && (
        <TieShuffle candidates={top} chosenId={lobby.tiebreak!} onDone={() => setShuffleDone(true)} />
      )}

      {isTie && !shuffling && (
        <div className="card" style={{ textAlign: "center" }}>
          <p className="eyebrow">Too close to call</p>
          <h2>It's a {final.length}-way tie!</h2>
          <div className="tie-grid section">
            {final.map((t) => (
              <TiePoster key={t.movie.id} entry={t} />
            ))}
          </div>
          <div className="section">
            {isHost ? (
              <button type="button" className="btn btn-primary btn-lg" onClick={breakTie}>
                <Dices size={20} /> Let fate decide
              </button>
            ) : (
              <p className="muted" style={{ margin: 0 }}>
                Waiting for the host to break the tie…
              </p>
            )}
          </div>
        </div>
      )}

      {winner && (
        <>
          <Confetti key={winner.movie.id} />
          <WinnerHero entry={winner} byFate={top.length > 1} />
        </>
      )}

      {results.length > 0 && (
        <section className="section card" aria-label="Vote results">
          <h3>The votes</h3>
          <VoteBars results={results} winnerIds={winner ? [winner.movie.id] : top.map((t) => t.movie.id)} />
        </section>
      )}

      <div className="section" style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
        {isHost && !lobby.nextLobby && (
          <button type="button" className="btn btn-primary btn-lg" onClick={playAgain} disabled={starting}>
            <RotateCcw size={18} /> {starting ? "Starting…" : "Play again with this group"}
          </button>
        )}
        {isHost && lobby.nextLobby && (
          <Link to={`/lobby/${lobby.nextLobby}`} className="btn btn-primary btn-lg">
            Go to the next round
          </Link>
        )}
        <Link to="/" className="btn btn-lg">
          <Home size={18} /> Home
        </Link>
      </div>
    </div>
  );
}

function WinnerHero({ entry, byFate }: { entry: TallyEntry; byFate: boolean }) {
  const { movie, votes } = entry;
  const backdrop = imageUrl(movie.backdropPath, "w1280") ?? imageUrl(movie.posterPath, "w780");
  return (
    <article className="winner" aria-live="polite">
      {backdrop && <div className="winner-backdrop" style={{ backgroundImage: `url(${backdrop})` }} aria-hidden="true" />}
      <div className="winner-body">
        <div className="winner-poster">
          {movie.posterPath && <img src={imageUrl(movie.posterPath, "w500")} alt={`${movie.title} poster`} />}
        </div>
        <div>
          <p className="eyebrow">{byFate ? "Fate has spoken. Tonight it's…" : "Tonight we're watching"}</p>
          <h2 className="winner-title">{movie.title}</h2>
          <div className="details-meta">
            {movie.year && <span>{movie.year}</span>}
            {movie.rating !== undefined && (
              <span className="rating">
                <Star size={14} fill="currentColor" aria-hidden="true" /> {movie.rating.toFixed(1)}
              </span>
            )}
            <span>
              {votes} {votes === 1 ? "vote" : "votes"}
            </span>
          </div>
          {movie.overview && <p>{movie.overview}</p>}
          <div className="winner-actions">
            <TrailerButton movieId={movie.id} className="btn btn-primary" />
          </div>
          <WhereToWatch movieId={movie.id} />
        </div>
      </div>
    </article>
  );
}

function TiePoster({ entry, lit }: { entry: TallyEntry; lit?: boolean }) {
  const poster = imageUrl(entry.movie.posterPath, "w342");
  return (
    <div className={`movie-card ${lit ? "is-lit" : ""}`}>
      <div className="movie-card-poster">
        {poster ? <img src={poster} alt="" /> : <span className="movie-card-placeholder">{entry.movie.title}</span>}
      </div>
      <span className="movie-card-meta">
        <span className="movie-card-title">{entry.movie.title}</span>
      </span>
    </div>
  );
}

/** Flicks a highlight across the tied movies and lands on the one the host's coin toss chose. */
function TieShuffle({ candidates, chosenId, onDone }: { candidates: TallyEntry[]; chosenId: string; onDone: () => void }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const chosen = candidates.findIndex((c) => c.movie.id === chosenId);
    const total = candidates.length * 3 + Math.max(0, chosen);
    let n = 0;
    let finish: ReturnType<typeof setTimeout> | undefined;
    const timer = setInterval(() => {
      n += 1;
      setStep(n);
      if (n >= total) {
        clearInterval(timer);
        finish = setTimeout(onDone, 700);
      }
    }, 140);
    return () => {
      clearInterval(timer);
      clearTimeout(finish);
    };
    // Runs once: the shuffle should not restart if the lobby re-renders mid-animation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="card" style={{ textAlign: "center" }}>
      <p className="eyebrow">Breaking the tie</p>
      <h2>Let fate decide…</h2>
      <div className="tie-grid section">
        {candidates.map((t, i) => (
          <TiePoster key={t.movie.id} entry={t} lit={step % candidates.length === i} />
        ))}
      </div>
    </div>
  );
}

function VoteBars({ results, winnerIds }: { results: TallyEntry[]; winnerIds: string[] }) {
  const max = Math.max(1, ...results.map((r) => r.votes));
  return (
    <ol className="bars">
      {results.map(({ movie, votes }, i) => (
        <li key={movie.id} className={`bar ${winnerIds.includes(movie.id) && votes > 0 ? "is-winner" : ""}`}>
          <div className="bar-thumb">{movie.posterPath && <img src={imageUrl(movie.posterPath, "w92")} alt="" />}</div>
          <div className="bar-label">
            <strong>{movie.title}</strong>
            <div className="bar-track" aria-hidden="true">
              <div
                className="bar-fill"
                style={{ width: `${(votes / max) * 100}%`, animationDelay: `${i * 80}ms` } as CSSProperties}
              />
            </div>
          </div>
          <span className="bar-count">
            {votes}
            <span className="visually-hidden"> {votes === 1 ? "vote" : "votes"}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}
