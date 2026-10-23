import { isValidLobbyCode } from "./lobbyCode";

const KEY = "wsww:recent-lobbies";
const MAX = 4;

/** Lobby codes this browser visited, most recent first. */
export function recentLobbies(): string[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((c): c is string => typeof c === "string" && isValidLobbyCode(c)) : [];
  } catch {
    return [];
  }
}

function save(codes: string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(codes.slice(0, MAX)));
  } catch {
    // Not remembering recent lobbies is fine.
  }
}

export function rememberLobby(code: string) {
  save([code, ...recentLobbies().filter((c) => c !== code)]);
}

export function forgetLobby(code: string) {
  save(recentLobbies().filter((c) => c !== code));
}
