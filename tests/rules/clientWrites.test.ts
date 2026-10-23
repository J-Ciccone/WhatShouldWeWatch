// Runs the app's real write functions (src/services/lobby.ts) against the Auth
// and Database emulators, so a change to a write path or payload that the rules
// would reject fails here instead of in production.
import { signInAnonymously, signOut, updateCurrentUser, type User } from "firebase/auth";
import { get, ref, serverTimestamp, set } from "firebase/database";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { auth } from "../../src/firebase/auth";
import { db } from "../../src/firebase/db";
import { generateLobbyCode } from "../../src/lib/lobbyCode";
import type { Lobby } from "../../src/lib/types";
import * as lobby from "../../src/services/lobby";

// Never let these writes reach the live database.
if (import.meta.env.VITE_USE_EMULATORS !== "true") {
  throw new Error("clientWrites tests must run against the emulators: use `npm run test:rules`.");
}

vi.mock("../../src/lib/lobbyCode", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../src/lib/lobbyCode")>();
  return { ...actual, generateLobbyCode: vi.fn(actual.generateLobbyCode) };
});

const settings = { numMovies: 2, unlimitedVotes: false };
const ALIEN = {
  id: "348",
  title: "Alien",
  year: "1979",
  posterPath: "/vfrQk5IPloGg1v9Rzbh2Eg3VGyM.jpg",
  backdropPath: "/AmR3JG1VQVxU8TfAvljUhfSFUOx.jpg",
  overview: "In space no one can hear you scream.",
  rating: 8.1,
};
const MATRIX = { id: "603", title: "The Matrix", year: "1999" };

async function newUser(): Promise<User> {
  await signOut(auth);
  return (await signInAnonymously(auth)).user;
}

async function actAs(user: User) {
  await updateCurrentUser(auth, user);
}

async function read(code: string): Promise<Lobby> {
  return (await get(ref(db, `lobbies/${code}`))).val() as Lobby;
}

beforeEach(() => vi.mocked(generateLobbyCode).mockClear());
afterAll(() => signOut(auth));

describe("client write paths", () => {
  it("runs a whole movie night through the real service functions", async () => {
    const host = await newUser();
    const code = await lobby.createLobby(host.uid, settings, "Host");
    await lobby.addPick(code, host.uid, ALIEN);

    const guest = await newUser();
    await lobby.joinLobby(code, guest.uid, "Guest");
    await lobby.addPick(code, guest.uid, MATRIX);
    const joinedAt = (await read(code)).members?.[guest.uid];
    await lobby.renameMember(code, guest.uid, "Gus", typeof joinedAt === "object" ? joinedAt.joinedAt : 0);
    await expect(lobby.setStage(code, "VOTING")).rejects.toThrow();

    await actAs(host);
    await lobby.setStage(code, "VOTING");
    await lobby.setSingleVote(code, host.uid, "348");

    await actAs(guest);
    await lobby.setSingleVote(code, guest.uid, "603");
    await lobby.setSingleVote(code, guest.uid, null);
    await lobby.setSingleVote(code, guest.uid, "603");
    await expect(lobby.setTiebreak(code, "603")).rejects.toThrow();

    await actAs(host);
    await lobby.setStage(code, "DONE");
    await lobby.setTiebreak(code, "348");
    const next = await lobby.startNextRound(code, host.uid, settings, "Host");

    const done = await read(code);
    expect(done.members?.[guest.uid]).toMatchObject({ name: "Gus" });
    expect(done.picks?.[host.uid]?.["348"]).toEqual({ ...ALIEN, id: undefined });
    expect(done.votes).toEqual({ [host.uid]: "348", [guest.uid]: "603" });
    expect(done.tiebreak).toBe("348");
    expect(done.nextLobby).toBe(next);
    expect((await read(next)).stage).toBe("PICKING");
  });

  it("records votes in the unlimited shape", async () => {
    const host = await newUser();
    const code = await lobby.createLobby(host.uid, { numMovies: 2, unlimitedVotes: true }, "Host");
    await lobby.addPick(code, host.uid, ALIEN);
    await lobby.addPick(code, host.uid, MATRIX);
    await lobby.setStage(code, "VOTING");
    await lobby.setMultiVote(code, host.uid, "348", true);
    await lobby.setMultiVote(code, host.uid, "603", true);
    await lobby.setMultiVote(code, host.uid, "348", false);
    expect((await read(code)).votes).toEqual({ [host.uid]: { "603": true } });
  });

  it("picks a fresh code when the generated one is already taken", async () => {
    const someone = await newUser();
    const taken = await lobby.createLobby(someone.uid, settings, "First");

    const host = await newUser();
    vi.mocked(generateLobbyCode).mockReturnValueOnce(taken);
    const code = await lobby.createLobby(host.uid, settings, "Second");

    expect(code).not.toBe(taken);
    expect((await read(taken)).hostId).toBe(someone.uid);
    expect((await read(code)).hostId).toBe(host.uid);
  });

  it("still lets players who joined before names existed rename themselves", async () => {
    const host = await newUser();
    const code = await lobby.createLobby(host.uid, settings, "Host");
    const old = await newUser();
    await set(ref(db, `lobbies/${code}/members/${old.uid}`), serverTimestamp());
    const before = (await read(code)).members?.[old.uid];
    expect(typeof before).toBe("number");
    await lobby.renameMember(code, old.uid, "Old Timer", before as number);
    expect((await read(code)).members?.[old.uid]).toEqual({ name: "Old Timer", joinedAt: before });
  });
});
