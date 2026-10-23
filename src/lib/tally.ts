import type { Lobby, Movie } from "./types";

export interface PoolEntry {
  movie: Movie;
  pickedBy: string[];
}

/** Every distinct movie anyone picked, in a stable order (by title, then id). */
export function moviePool(lobby: Pick<Lobby, "picks">): PoolEntry[] {
  const byId = new Map<string, PoolEntry>();
  for (const [uid, picks] of Object.entries(lobby.picks ?? {})) {
    for (const [id, stored] of Object.entries(picks ?? {})) {
      const entry = byId.get(id);
      if (entry) {
        entry.pickedBy.push(uid);
        // Fill in anything the first copy lacks (e.g. a pick saved by an older
        // version of the app without a poster or rating).
        entry.movie = { ...stored, ...entry.movie };
      } else {
        byId.set(id, { movie: { ...stored, id }, pickedBy: [uid] });
      }
    }
  }
  return [...byId.values()].sort(
    (a, b) => a.movie.title.localeCompare(b.movie.title) || a.movie.id.localeCompare(b.movie.id),
  );
}

/** The movie ids a user voted for, whichever shape their vote is stored in. */
export function votesOf(lobby: Pick<Lobby, "votes">, uid: string): string[] {
  const vote = lobby.votes?.[uid];
  if (vote === undefined) return [];
  return typeof vote === "string" ? [vote] : Object.keys(vote);
}

export interface TallyEntry extends PoolEntry {
  votes: number;
}

/** Vote counts for every movie in the pool. Votes for movies not in the pool are ignored. */
export function tally(lobby: Pick<Lobby, "picks" | "votes">): TallyEntry[] {
  const counts = new Map<string, number>();
  for (const uid of Object.keys(lobby.votes ?? {})) {
    for (const id of new Set(votesOf(lobby, uid))) counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  return moviePool(lobby).map((entry) => ({ ...entry, votes: counts.get(entry.movie.id) ?? 0 }));
}

/** Number of people who have cast at least one vote. */
export function voterCount(lobby: Pick<Lobby, "votes">): number {
  return Object.keys(lobby.votes ?? {}).filter((uid) => votesOf(lobby, uid).length > 0).length;
}

/** The movie(s) with the most votes. More than one means a tie. */
export function winners(lobby: Pick<Lobby, "picks" | "votes">): TallyEntry[] {
  const results = tally(lobby);
  const top = Math.max(0, ...results.map((r) => r.votes));
  return results.filter((r) => r.votes === top);
}

/** Winners after applying the host's tie-break, if they made one. */
export function finalWinners(lobby: Pick<Lobby, "picks" | "votes" | "tiebreak">): TallyEntry[] {
  const top = winners(lobby);
  if (top.length > 1 && lobby.tiebreak) {
    const chosen = top.find((t) => t.movie.id === lobby.tiebreak);
    if (chosen) return [chosen];
  }
  return top;
}

/** A uniformly random element, using the crypto RNG. */
export function pickRandom<T>(items: readonly T[]): T {
  if (items.length === 0) throw new Error("pickRandom needs at least one item");
  const [n] = crypto.getRandomValues(new Uint32Array(1));
  return items[n! % items.length]!;
}
