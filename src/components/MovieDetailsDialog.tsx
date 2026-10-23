import { Check, Plus, Star } from "lucide-react";
import { imageUrl } from "../lib/tmdb";
import type { Movie } from "../lib/types";
import { TrailerButton } from "./TrailerButton";
import { Dialog } from "./ui/Dialog";
import { WhereToWatch } from "./WhereToWatch";

interface Props {
  movie: Movie | null;
  onClose: () => void;
  /** Shown as the primary action, e.g. pick or vote for this movie. */
  action?: { label: string; selectedLabel: string; selected: boolean; onToggle: () => void; disabled?: boolean };
}

export function MovieDetailsDialog({ movie, onClose, action }: Props) {
  return (
    <Dialog open={movie !== null} onClose={onClose} title={movie?.title ?? ""} wide>
      {movie && (
        <div className="details">
          <div className="details-poster">
            {movie.posterPath && <img src={imageUrl(movie.posterPath, "w342")} alt={`${movie.title} poster`} />}
          </div>
          <div>
            <div className="details-meta">
              {movie.year && <span>{movie.year}</span>}
              {movie.rating !== undefined && (
                <span className="rating">
                  <Star size={14} fill="currentColor" aria-hidden="true" /> {movie.rating.toFixed(1)}
                  <span className="visually-hidden"> out of 10</span>
                </span>
              )}
            </div>
            <p>{movie.overview || "No description available."}</p>
            <WhereToWatch movieId={movie.id} />
            <div className="details-actions">
              {action && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={action.onToggle}
                  disabled={action.disabled}
                  aria-pressed={action.selected}
                >
                  {action.selected ? <Check size={18} /> : <Plus size={18} />}
                  {action.selected ? action.selectedLabel : action.label}
                </button>
              )}
              <TrailerButton movieId={movie.id} />
            </div>
          </div>
        </div>
      )}
    </Dialog>
  );
}
