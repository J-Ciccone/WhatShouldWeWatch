import { posterUrl } from "../lib/tmdb";
import type { Movie } from "../lib/types";

interface Props {
  movie: Movie;
  selected: boolean;
  /** Shown over the poster on hover, e.g. "Select" or "Vote". */
  actionLabel: string;
  onClick: () => void;
  disabled?: boolean;
}

export function MovieCard({ movie, selected, actionLabel, onClick, disabled }: Props) {
  const poster = posterUrl(movie.posterPath);
  return (
    <button
      type="button"
      className={`movie-card ${selected ? "selected" : ""}`}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      aria-label={`${movie.title}${movie.year ? ` (${movie.year})` : ""}`}
    >
      <div className="movie-card-image">
        {poster ? (
          <img src={poster} alt="" loading="lazy" />
        ) : (
          <div className="movie-card-no-poster">{movie.title}</div>
        )}
        <div className="movie-card-overlay" aria-hidden="true">
          {selected ? <span className="material-symbols-outlined">check_circle</span> : actionLabel}
        </div>
      </div>
      <div className="movie-card-body">
        <div className="movie-card-title">{movie.title}</div>
        {movie.year && <div className="movie-card-year">{movie.year}</div>}
      </div>
    </button>
  );
}
