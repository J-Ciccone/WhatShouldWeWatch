import type { Movie } from "./types";

const API_BASE = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p";

interface TmdbMovieResult {
  id: number;
  title: string;
  release_date?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  overview?: string;
  vote_average?: number;
  vote_count?: number;
}

interface TmdbVideo {
  key: string;
  site: string;
  type: string;
  official?: boolean;
}

interface TmdbProvider {
  provider_id: number;
  provider_name: string;
  logo_path?: string | null;
}

interface TmdbRegionProviders {
  link?: string;
  flatrate?: TmdbProvider[];
  free?: TmdbProvider[];
  ads?: TmdbProvider[];
  rent?: TmdbProvider[];
  buy?: TmdbProvider[];
}

export interface Provider {
  id: number;
  name: string;
  logoPath?: string;
}

export interface WatchOptions {
  /** TMDB's "where to watch" page for the movie in this region. */
  link?: string;
  stream: Provider[];
  rent: Provider[];
  buy: Provider[];
}

export interface MovieExtras {
  trailerUrl?: string;
  watch: WatchOptions;
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
  if (result.backdrop_path) movie.backdropPath = result.backdrop_path;
  if (result.overview) movie.overview = result.overview.slice(0, 2000);
  if (result.vote_count && result.vote_average && result.vote_average > 0) {
    movie.rating = Math.round(Math.min(result.vote_average, 10) * 10) / 10;
  }
  return movie;
}

type ImageSize = "w92" | "w185" | "w342" | "w500" | "w780" | "w1280";

export function imageUrl(path: string | undefined, size: ImageSize = "w342") {
  return path ? `${IMAGE_BASE}/${size}${path}` : undefined;
}

interface RequestOptions {
  token?: string;
  signal?: AbortSignal;
}

async function tmdbGet<T>(path: string, params: Record<string, string>, options: RequestOptions = {}): Promise<T> {
  const token = options.token ?? import.meta.env.VITE_TMDB_READ_TOKEN;
  if (!token) throw new TmdbError("Movie search isn't configured (missing VITE_TMDB_READ_TOKEN).");
  const res = await fetch(`${API_BASE}${path}?${new URLSearchParams(params)}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    signal: options.signal,
  });
  if (!res.ok) {
    throw new TmdbError(
      res.status === 429 ? "Too many searches, try again in a moment." : `Movie search failed (${res.status}).`,
      res.status,
    );
  }
  return (await res.json()) as T;
}

export async function searchMovies(query: string, options: RequestOptions = {}): Promise<Movie[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const data = await tmdbGet<{ results?: TmdbMovieResult[] }>(
    "/search/movie",
    { query: trimmed, include_adult: "false", page: "1" },
    options,
  );
  return (data.results ?? []).map(toMovie);
}

export async function trendingMovies(options: RequestOptions = {}): Promise<Movie[]> {
  const data = await tmdbGet<{ results?: TmdbMovieResult[] }>("/trending/movie/week", {}, options);
  return (data.results ?? []).map(toMovie);
}

function toProviders(list: TmdbProvider[] | undefined): Provider[] {
  return (list ?? []).map((p) => {
    const provider: Provider = { id: p.provider_id, name: p.provider_name };
    if (p.logo_path) provider.logoPath = p.logo_path;
    return provider;
  });
}

function pickTrailer(videos: TmdbVideo[]): string | undefined {
  const youtube = videos.filter((v) => v.site === "YouTube" && v.key);
  const best =
    youtube.find((v) => v.type === "Trailer" && v.official) ??
    youtube.find((v) => v.type === "Trailer") ??
    youtube.find((v) => v.type === "Teaser");
  return best ? `https://www.youtube.com/watch?v=${encodeURIComponent(best.key)}` : undefined;
}

/** Trailer and where-to-watch info for one movie, in one request. */
export async function movieExtras(
  movieId: string,
  region: string,
  options: RequestOptions = {},
): Promise<MovieExtras> {
  const data = await tmdbGet<{
    videos?: { results?: TmdbVideo[] };
    "watch/providers"?: { results?: Record<string, TmdbRegionProviders> };
  }>(`/movie/${encodeURIComponent(movieId)}`, { append_to_response: "videos,watch/providers" }, options);

  const local = data["watch/providers"]?.results?.[region];
  // "Free" and "with ads" services are still streaming as far as the group cares.
  const stream = [...toProviders(local?.flatrate), ...toProviders(local?.free), ...toProviders(local?.ads)].filter(
    (p, i, all) => all.findIndex((q) => q.id === p.id) === i,
  );
  const watch: WatchOptions = { stream, rent: toProviders(local?.rent), buy: toProviders(local?.buy) };
  if (local?.link) watch.link = local.link;

  const extras: MovieExtras = { watch };
  const trailerUrl = pickTrailer(data.videos?.results ?? []);
  if (trailerUrl) extras.trailerUrl = trailerUrl;
  return extras;
}

/** Two-letter region for where-to-watch, from the browser language (e.g. en-GB → GB). */
export function userRegion(language: string | undefined = globalThis.navigator?.language): string {
  const match = /[-_]([A-Za-z]{2})(?:$|[-_])/.exec(language ?? "");
  return match ? match[1]!.toUpperCase() : "US";
}
