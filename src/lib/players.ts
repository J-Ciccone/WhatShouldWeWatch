import { MAX_NAME_LENGTH, type Lobby, type MemberEntry } from "./types";
import { votesOf } from "./tally";

export interface Player {
  uid: string;
  name: string;
  isHost: boolean;
  joinedAt: number;
  color: string;
  initials: string;
}

const COLORS = ["#ff753b", "#f4b740", "#3ecf8e", "#38bdf8", "#a78bfa", "#f472b6", "#fb7185", "#2dd4bf"];

/** A stable color per player, so the same friend always has the same avatar. */
export function colorFor(uid: string): string {
  let hash = 0;
  for (const ch of uid) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return COLORS[hash % COLORS.length]!;
}

export function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const letters = words.slice(0, 2).map((w) => Array.from(w)[0] ?? "");
  return letters.join("").toUpperCase() || "?";
}

/** Trims and collapses whitespace and caps the length the database rules allow. */
export function cleanName(input: string): string {
  let name = input.replace(/\s+/g, " ").trim();
  // Cut by code points so an emoji is never split in half, then make sure the
  // UTF-16 length (what the rules measure) fits.
  const chars = Array.from(name);
  while (chars.join("").length > MAX_NAME_LENGTH) chars.pop();
  name = chars.join("").trim();
  return name;
}

function entryName(entry: MemberEntry | undefined): string | null {
  return typeof entry === "object" && entry !== null && entry.name.trim() ? entry.name : null;
}

function entryJoinedAt(entry: MemberEntry | undefined): number {
  if (typeof entry === "number") return entry;
  return entry?.joinedAt ?? 0;
}

/** Everyone in the lobby, in the order they joined. Unnamed players get "Player N". */
export function playersOf(lobby: Pick<Lobby, "members" | "hostId">): Player[] {
  const entries = Object.entries(lobby.members ?? {}).sort(
    ([a, ea], [b, eb]) => entryJoinedAt(ea) - entryJoinedAt(eb) || a.localeCompare(b),
  );
  return entries.map(([uid, entry], index) => {
    const name = entryName(entry) ?? `Player ${index + 1}`;
    return {
      uid,
      name,
      isHost: uid === lobby.hostId,
      joinedAt: entryJoinedAt(entry),
      color: colorFor(uid),
      initials: initialsOf(name),
    };
  });
}

export function playerName(lobby: Pick<Lobby, "members" | "hostId">, uid: string): string {
  return playersOf(lobby).find((p) => p.uid === uid)?.name ?? "Someone";
}

/** Whether a player is done with the current stage: picked their quota, or voted. */
export function isPlayerDone(lobby: Lobby, uid: string): boolean {
  if (lobby.stage === "PICKING") return Object.keys(lobby.picks?.[uid] ?? {}).length >= lobby.settings.numMovies;
  if (lobby.stage === "VOTING") return votesOf(lobby, uid).length > 0;
  return true;
}

const NAME_KEY = "wsww:name";

export function loadSavedName(): string {
  try {
    return cleanName(localStorage.getItem(NAME_KEY) ?? "");
  } catch {
    return "";
  }
}

export function saveName(name: string) {
  try {
    localStorage.setItem(NAME_KEY, name);
  } catch {
    // Storage can be unavailable (private mode); the name just won't be remembered.
  }
}
