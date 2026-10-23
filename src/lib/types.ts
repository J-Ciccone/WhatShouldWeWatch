export const STAGES = ["PICKING", "VOTING", "DONE"] as const;
export type Stage = (typeof STAGES)[number];

/** A movie as stored in a player's picks. Ids are TMDB ids, as strings. */
export interface Movie {
  id: string;
  title: string;
  year?: string;
  posterPath?: string;
  overview?: string;
}

/** What is stored under picks/{uid}/{movieId}. */
export type StoredMovie = Omit<Movie, "id">;

export interface LobbySettings {
  numMovies: number;
  unlimitedVotes: boolean;
}

/**
 * Shape of lobbies/{code} in the Realtime Database.
 * votes/{uid} is a movie id in single-vote lobbies, or a set of
 * {movieId: true} in unlimited-vote lobbies.
 */
export interface Lobby {
  hostId: string;
  createdAt: number;
  settings: LobbySettings;
  stage: Stage;
  members?: Record<string, number>;
  picks?: Record<string, Record<string, StoredMovie>>;
  votes?: Record<string, string | Record<string, true>>;
}

/**
 * True for a lobby written by this version of the app. The live database also
 * holds lobbies from v1 (no hostId/settings), which must be treated as missing.
 */
export function isLobby(value: unknown): value is Lobby {
  if (typeof value !== "object" || value === null) return false;
  const { hostId, settings, stage } = value as Record<string, unknown>;
  if (typeof hostId !== "string" || typeof settings !== "object" || settings === null) return false;
  const { numMovies, unlimitedVotes } = settings as Record<string, unknown>;
  return (
    typeof numMovies === "number" &&
    typeof unlimitedVotes === "boolean" &&
    (STAGES as readonly unknown[]).includes(stage)
  );
}

export const MIN_MOVIES_TO_VOTE = 2;
export const MOVIES_PER_PERSON_OPTIONS = [2, 3, 4, 5] as const;
