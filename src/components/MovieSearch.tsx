import { Search, X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { useTrending } from "../hooks/useTmdb";
import { searchMovies } from "../lib/tmdb";
import type { Movie } from "../lib/types";
import { MovieCard } from "./MovieCard";
import { Spinner } from "./ui/Spinner";

type SearchResult = { query: string; movies: Movie[] } | { query: string; error: string };

interface Props {
  isSelected: (movieId: string) => boolean;
  onToggle: (movie: Movie) => void;
  onInfo: (movie: Movie) => void;
  disabled?: boolean;
}

const DEBOUNCE_MS = 350;

/** Search-as-you-type, with this week's popular movies before anything is typed. */
export function MovieSearch({ isSelected, onToggle, onInfo, disabled }: Props) {
  const [query, setQuery] = useState("");
  const trimmed = query.trim();
  const debounced = useDebouncedValue(trimmed, DEBOUNCE_MS);
  // Pressing Enter searches right away instead of waiting out the debounce.
  const [submitted, setSubmitted] = useState("");
  const active = submitted === trimmed ? submitted : debounced;
  const [result, setResult] = useState<SearchResult | null>(null);
  const trending = useTrending();

  useEffect(() => {
    if (!active) return;
    const controller = new AbortController();
    searchMovies(active, { signal: controller.signal }).then(
      (movies) => setResult({ query: active, movies }),
      (err: unknown) => {
        if (controller.signal.aborted) return;
        setResult({ query: active, error: err instanceof Error ? err.message : "Search failed." });
      },
    );
    return () => controller.abort();
  }, [active]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(trimmed);
    // Close the phone keyboard so the results are visible.
    (document.activeElement as HTMLElement | null)?.blur();
  };

  const grid = (movies: Movie[]) => (
    <div className="movie-grid">
      {movies.map((movie) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          selected={isSelected(movie.id)}
          actionLabel="Pick"
          selectedLabel="Picked"
          onToggle={() => onToggle(movie)}
          onInfo={() => onInfo(movie)}
          disabled={disabled}
        />
      ))}
    </div>
  );

  let body;
  if (!trimmed) {
    body =
      trending.status === "ready" && trending.data.length > 0 ? (
        <>
          <div className="section-head">
            <h3>Popular this week</h3>
          </div>
          {grid(trending.data)}
        </>
      ) : trending.status === "loading" ? (
        <div className="empty">
          <Spinner label="Loading popular movies…" />
        </div>
      ) : (
        <p className="empty">Search for a movie you'd like to watch.</p>
      );
  } else if (!result || result.query !== trimmed) {
    body = (
      <div className="empty">
        <Spinner label="Searching…" />
      </div>
    );
  } else if ("error" in result) {
    body = (
      <div className="alert" role="alert">
        {result.error}
      </div>
    );
  } else if (result.movies.length === 0) {
    body = <p className="empty">No movies found for “{result.query}”. Try another title?</p>;
  } else {
    body = grid(result.movies);
  }

  return (
    <section aria-label="Find movies">
      <form className="search-bar input-with-icon" onSubmit={submit} role="search">
        <Search size={20} aria-hidden="true" />
        <input
          className="input"
          type="search"
          placeholder="Search for a movie…"
          aria-label="Movie title"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          enterKeyHint="search"
          autoComplete="off"
        />
        {query && (
          <button type="button" className="icon-btn btn-ghost search-clear" onClick={() => setQuery("")} aria-label="Clear search">
            <X size={18} />
          </button>
        )}
      </form>
      <div className="section" aria-live="polite">
        {body}
      </div>
    </section>
  );
}
