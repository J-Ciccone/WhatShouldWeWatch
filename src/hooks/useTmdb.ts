import { useEffect, useState } from "react";
import { movieExtras, trendingMovies, userRegion, type MovieExtras } from "../lib/tmdb";
import type { Movie } from "../lib/types";

// Module-level caches: these change slowly, and several components on one
// screen ask for the same thing.
let trendingRequest: Promise<Movie[]> | null = null;
const extrasRequests = new Map<string, Promise<MovieExtras>>();

/** Test hook: forget cached TMDB responses. */
export function resetTmdbCache() {
  trendingRequest = null;
  extrasRequests.clear();
}

function cached<T>(get: () => Promise<T> | null | undefined, set: (p: Promise<T> | null) => void, load: () => Promise<T>) {
  let request = get();
  if (!request) {
    request = load();
    set(request);
    // Don't cache failures; the next caller retries.
    request.catch(() => set(null));
  }
  return request;
}

export type Loadable<T> = { status: "loading" } | { status: "ready"; data: T } | { status: "error" };

/** This week's popular movies, for picking without typing. */
export function useTrending(): Loadable<Movie[]> {
  const [state, setState] = useState<Loadable<Movie[]>>({ status: "loading" });
  useEffect(() => {
    let live = true;
    cached(
      () => trendingRequest,
      (p) => (trendingRequest = p),
      () => trendingMovies(),
    ).then(
      (data) => live && setState({ status: "ready", data }),
      () => live && setState({ status: "error" }),
    );
    return () => {
      live = false;
    };
  }, []);
  return state;
}

/** Trailer and where-to-watch for a movie. Pass null to skip loading. */
export function useMovieExtras(movieId: string | null): Loadable<MovieExtras> {
  const [state, setState] = useState<{ id: string; value: Loadable<MovieExtras> } | null>(null);

  useEffect(() => {
    if (!movieId) return;
    let live = true;
    const region = userRegion();
    const key = `${movieId}:${region}`;
    cached(
      () => extrasRequests.get(key),
      (p) => (p ? extrasRequests.set(key, p) : extrasRequests.delete(key)),
      () => movieExtras(movieId, region),
    ).then(
      (data) => live && setState({ id: movieId, value: { status: "ready", data } }),
      () => live && setState({ id: movieId, value: { status: "error" } }),
    );
    return () => {
      live = false;
    };
  }, [movieId]);

  return movieId && state?.id === movieId ? state.value : { status: "loading" };
}
