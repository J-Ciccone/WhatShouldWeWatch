import { Play } from "lucide-react";
import { useMovieExtras } from "../hooks/useTmdb";

/** Opens the movie's trailer on YouTube, if TMDB knows one. */
export function TrailerButton({ movieId, className = "btn" }: { movieId: string; className?: string }) {
  const extras = useMovieExtras(movieId);
  if (extras.status !== "ready" || !extras.data.trailerUrl) return null;
  return (
    <a className={className} href={extras.data.trailerUrl} target="_blank" rel="noreferrer">
      <Play size={18} fill="currentColor" /> Watch trailer
    </a>
  );
}
