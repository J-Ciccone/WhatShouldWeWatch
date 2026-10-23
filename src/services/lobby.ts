import { get, onValue, ref, remove, serverTimestamp, set } from "firebase/database";
import { db } from "../firebase/db";
import { generateLobbyCode } from "../lib/lobbyCode";
import { isLobby, type Lobby, type LobbySettings, type Movie, type Stage, type StoredMovie } from "../lib/types";

const lobbyPath = (code: string) => `lobbies/${code}`;

const memberRecord = (name: string, joinedAt?: number) => ({ name, joinedAt: joinedAt ?? serverTimestamp() });

/**
 * Creates a lobby with the caller as host and first member, returning its code.
 * The security rules refuse to overwrite an existing lobby, so on a failed write
 * we check whether the code was taken and, if so, try a fresh one.
 */
export async function createLobby(uid: string, settings: LobbySettings, name: string): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateLobbyCode();
    const lobbyRef = ref(db, lobbyPath(code));
    try {
      await set(lobbyRef, {
        hostId: uid,
        createdAt: serverTimestamp(),
        settings,
        stage: "PICKING" satisfies Stage,
        members: { [uid]: memberRecord(name) },
      });
      return code;
    } catch (error) {
      const existing = await get(lobbyRef).catch(() => null);
      if (!existing?.exists()) throw error;
    }
  }
  throw new Error("Couldn't find a free lobby code. Please try again.");
}

export function joinLobby(code: string, uid: string, name: string) {
  return set(ref(db, `${lobbyPath(code)}/members/${uid}`), memberRecord(name));
}

/** Changes your display name, keeping your place in the join order. */
export function renameMember(code: string, uid: string, name: string, joinedAt: number) {
  return set(ref(db, `${lobbyPath(code)}/members/${uid}`), memberRecord(name, joinedAt || undefined));
}

export function setStage(code: string, stage: Stage) {
  return set(ref(db, `${lobbyPath(code)}/stage`), stage);
}

export function addPick(code: string, uid: string, { id, ...movie }: Movie) {
  return set(ref(db, `${lobbyPath(code)}/picks/${uid}/${id}`), movie satisfies StoredMovie);
}

export function removePick(code: string, uid: string, movieId: string) {
  return remove(ref(db, `${lobbyPath(code)}/picks/${uid}/${movieId}`));
}

/** Single-vote lobbies: votes/{uid} is one movie id. Pass null to withdraw the vote. */
export function setSingleVote(code: string, uid: string, movieId: string | null) {
  const voteRef = ref(db, `${lobbyPath(code)}/votes/${uid}`);
  return movieId === null ? remove(voteRef) : set(voteRef, movieId);
}

/** Unlimited-vote lobbies: votes/{uid} is a set of movie ids. */
export function setMultiVote(code: string, uid: string, movieId: string, voted: boolean) {
  const voteRef = ref(db, `${lobbyPath(code)}/votes/${uid}/${movieId}`);
  return voted ? set(voteRef, true) : remove(voteRef);
}

/** Host only, after the vote: settles a tie for everyone. Can only be set once. */
export function setTiebreak(code: string, movieId: string) {
  return set(ref(db, `${lobbyPath(code)}/tiebreak`), movieId);
}

/**
 * Host only, after the vote: opens a fresh lobby with the same settings and
 * points this one at it so everyone else can hop over with one tap.
 */
export async function startNextRound(code: string, uid: string, settings: LobbySettings, name: string) {
  const next = await createLobby(uid, settings, name);
  await set(ref(db, `${lobbyPath(code)}/nextLobby`), next);
  return next;
}

export function subscribeToLobby(
  code: string,
  onLobby: (lobby: Lobby | null) => void,
  onError: (error: Error) => void,
) {
  return onValue(
    ref(db, lobbyPath(code)),
    (snap) => {
      const value: unknown = snap.val();
      onLobby(isLobby(value) ? value : null);
    },
    onError,
  );
}
