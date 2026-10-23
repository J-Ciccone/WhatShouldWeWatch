import type { Movie } from "./types";

const API_BASE = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p";

interface TmdbMovieResult {
  id: number;
  title: string;
  release_date?: string;
  poster_path?: string | null;
  overview?: string;
}

export class TmdbError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "TmdbError";
  }
}

export function toMovie(result: TmdbMovieResult): Movie {
  const movie: Movie = { id: String(result.id), title: result.title };
  // Firebase rejects undefined/null values, so only set fields that exist.
  const year = result.release_date?.slice(0, 4);
  if (year && /^\d{4}$/.test(year)) movie.year = year;
  if (result.poster_path) movie.posterPath = result.poster_path;
  if (result.overview) movie.overview = result.overview.slice(0, 2000);
  return movie;
}

export function posterUrl(posterPath: string | undefined, size: "w185" | "w342" | "w500" = "w342") {
  return posterPath ? `${IMAGE_BASE}/${size}${posterPath}` : undefined;
}

export async function searchMovies(
  query: string,
  { token = import.meta.env.VITE_TMDB_READ_TOKEN, signal }: { token?: string; signal?: AbortSignal } = {},
): Promise<Movie[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];
  if (!token) throw new TmdbError("Movie search isn't configured (missing VITE_TMDB_READ_TOKEN).");

  const params = new URLSearchParams({ query: trimmed, include_adult: "false", page: "1" });
  const res = await fetch(`${API_BASE}/search/movie?${params}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    signal,
  });
  if (!res.ok) {
    throw new TmdbError(
      res.status === 429 ? "Too many searches, try again in a moment." : `Movie search failed (${res.status}).`,
      res.status,
    );
  }
  const data = (await res.json()) as { results?: TmdbMovieResult[] };
  return (data.results ?? []).map(toMovie);
}
