import { Check, Info, Plus, Star } from "lucide-react";
import type { ReactNode } from "react";
import { imageUrl } from "../lib/tmdb";
import type { Movie } from "../lib/types";

interface Props {
  movie: Movie;
  selected: boolean;
  /** Badge text when not selected, e.g. "Pick" or "Vote". */
  actionLabel: string;
  /** Badge text when selected, e.g. "Picked" or "Your vote". */
  selectedLabel: string;
  onToggle: () => void;
  onInfo?: () => void;
  disabled?: boolean;
  footer?: ReactNode;
}

export function MovieCard({ movie, selected, actionLabel, selectedLabel, onToggle, onInfo, disabled, footer }: Props) {
  const poster = imageUrl(movie.posterPath, "w342");
  return (
    <div className={`movie-card ${selected ? "is-selected" : ""}`}>
      <button
        type="button"
        className="movie-card-main"
        onClick={onToggle}
        disabled={disabled}
        aria-pressed={selected}
        aria-label={`${movie.title}${movie.year ? ` (${movie.year})` : ""}`}
      >
        <span className="movie-card-poster">
          {poster ? (
            <img src={poster} alt="" loading="lazy" />
          ) : (
            <span className="movie-card-placeholder">{movie.title}</span>
          )}
          <span className="movie-card-badge" aria-hidden="true">
            {selected ? <Check size={16} /> : <Plus size={16} />}
            {selected ? selectedLabel : actionLabel}
          </span>
        </span>
        <span className="movie-card-meta">
          <span className="movie-card-title">{movie.title}</span>
          <span className="movie-card-sub">
            {movie.year && <span>{movie.year}</span>}
            {movie.rating !== undefined && (
              <span className="rating">
                <Star size={13} fill="currentColor" aria-hidden="true" />
                <span className="visually-hidden">rated</span>
                {movie.rating.toFixed(1)}
              </span>
            )}
          </span>
        </span>
      </button>
      {onInfo && (
        <button type="button" className="movie-card-info" onClick={onInfo} aria-label={`More about ${movie.title}`}>
          <Info size={18} />
        </button>
      )}
      {footer && <div className="movie-card-footer">{footer}</div>}
    </div>
  );
}
