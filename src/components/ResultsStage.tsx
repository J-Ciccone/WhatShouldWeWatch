import { Link } from "react-router";
import { posterUrl } from "../lib/tmdb";
import { tally, winners } from "../lib/tally";
import type { Lobby } from "../lib/types";

export function ResultsStage({ lobby }: { lobby: Lobby }) {
  const results = tally(lobby).sort((a, b) => b.votes - a.votes);
  const top = winners(lobby);
  const nobodyVoted = results.length > 0 && top[0]!.votes === 0;

  let heading = "Let's watch";
  if (results.length === 0) heading = "No movies were picked";
  else if (nobodyVoted) heading = "Nobody voted!";
  else if (top.length > 1) heading = "It's a tie!";

  return (
    <div className="results">
      <h2 className="results-heading">{heading}</h2>

      {!nobodyVoted &&
        top.map(({ movie, votes }) => {
          const poster = posterUrl(movie.posterPath, "w500");
          return (
            <article key={movie.id} className="panel winner-card">
              {poster && <img src={poster} alt={`${movie.title} poster`} className="winner-poster" />}
              <div>
                <h3 className="winner-title">
                  {movie.title} {movie.year && <small className="text-muted">({movie.year})</small>}
                </h3>
                <p className="text-muted">
                  {votes} {votes === 1 ? "vote" : "votes"}
                </p>
                {movie.overview && <p>{movie.overview}</p>}
              </div>
            </article>
          );
        })}

      {results.length > 0 && (
        <div className="panel">
          <h4>All results</h4>
          <ol className="results-list">
            {results.map(({ movie, votes }) => (
              <li key={movie.id}>
                <span>
                  {movie.title} {movie.year && <em>({movie.year})</em>}
                </span>
                <span>
                  {votes} {votes === 1 ? "vote" : "votes"}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="text-center my-4">
        <Link to="/" className="btn btn-primary">
          Back to home
        </Link>
      </div>
    </div>
  );
}
