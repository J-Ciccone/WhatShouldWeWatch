import { useEffect, useRef, useState, type FormEvent } from "react";
import { Spinner } from "react-bootstrap";
import { searchMovies } from "../lib/tmdb";
import type { Movie } from "../lib/types";
import { MovieCard } from "./MovieCard";

type SearchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; query: string; results: Movie[] }
  | { status: "error"; message: string };

interface Props {
  isSelected: (movieId: string) => boolean;
  onToggle: (movie: Movie) => void;
  disabled?: boolean;
}

export function MovieSearch({ isSelected, onToggle, disabled }: Props) {
  const [query, setQuery] = useState("");
  const [state, setState] = useState<SearchState>({ status: "idle" });
  const inFlight = useRef<AbortController | null>(null);

  useEffect(() => () => inFlight.current?.abort(), []);

  const search = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    // Drop any older search so its late results can't replace these.
    inFlight.current?.abort();
    const controller = new AbortController();
    inFlight.current = controller;
    setState({ status: "loading" });
    try {
      const results = await searchMovies(trimmed, { signal: controller.signal });
      setState({ status: "done", query: trimmed, results });
    } catch (err) {
      if (controller.signal.aborted) return;
      setState({ status: "error", message: err instanceof Error ? err.message : "Search failed." });
    }
  };

  return (
    <section aria-label="Search movies">
      <form className="input-group" onSubmit={search} role="search">
        <input
          className="form-control pill-input"
          type="search"
          placeholder="Search for a movie…"
          aria-label="Movie title"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="btn btn-primary pill-input-button" type="submit" aria-label="Search">
          <span className="material-symbols-outlined icon-inline" aria-hidden="true">
            search
          </span>
        </button>
      </form>

      <div className="search-results" aria-live="polite">
        {state.status === "idle" && <p className="search-hint">Search for movies you'd like to watch.</p>}
        {state.status === "loading" && (
          <div className="search-hint">
            <Spinner animation="border" size="sm" role="status" /> Searching…
          </div>
        )}
        {state.status === "error" && (
          <div className="alert alert-warning" role="alert">
            {state.message}
          </div>
        )}
        {state.status === "done" && state.results.length === 0 && (
          <p className="search-hint">No movies found for "{state.query}".</p>
        )}
        {state.status === "done" && state.results.length > 0 && (
          <div className="movie-grid">
            {state.results.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                selected={isSelected(movie.id)}
                actionLabel="Select"
                onClick={() => onToggle(movie)}
                disabled={disabled}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
