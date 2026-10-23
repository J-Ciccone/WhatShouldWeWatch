import { X } from "lucide-react";
import { imageUrl } from "../lib/tmdb";
import type { StoredMovie } from "../lib/types";

interface Props {
  picks: Record<string, StoredMovie>;
  limit: number;
  onRemove: (movieId: string) => void;
}

/** Your picks as little posters, with empty slots for the ones still to choose. */
export function PicksTray({ picks, limit, onRemove }: Props) {
  const ids = Object.keys(picks);
  const empty = Math.max(0, limit - ids.length);
  return (
    <div className="tray" aria-label="Your picks">
      {ids.map((id) => {
        const movie = picks[id]!;
        return (
          <div key={id} className="tray-slot is-filled" title={movie.title}>
            {movie.posterPath && <img src={imageUrl(movie.posterPath, "w92")} alt="" />}
            <button type="button" onClick={() => onRemove(id)} aria-label={`Remove ${movie.title}`}>
              <X size={18} />
            </button>
          </div>
        );
      })}
      {Array.from({ length: empty }, (_, i) => (
        <div key={`empty-${i}`} className="tray-slot" aria-hidden="true" />
      ))}
      <span className="tray-count">
        {ids.length}/{limit}
        <span className="visually-hidden"> picked</span>
      </span>
    </div>
  );
}
