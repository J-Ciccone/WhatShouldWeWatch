import { afterEach, describe, expect, it } from "vitest";
import { cleanName, colorFor, initialsOf, isPlayerDone, loadSavedName, playerName, playersOf, saveName } from "./players";
import type { Lobby } from "./types";

afterEach(() => localStorage.clear());

function lobby(overrides: Partial<Lobby> = {}): Lobby {
  return {
    hostId: "host",
    createdAt: 1,
    settings: { numMovies: 2, unlimitedVotes: false },
    stage: "PICKING",
    members: {
      guest: { name: "Bea", joinedAt: 20 },
      host: { name: "Al", joinedAt: 10 },
      old: 30,
    },
    ...overrides,
  };
}

describe("playersOf", () => {
  it("lists players in join order, with names, host flag and fallback names", () => {
    const players = playersOf(lobby());
    expect(players.map((p) => [p.name, p.isHost])).toEqual([
      ["Al", true],
      ["Bea", false],
      ["Player 3", false],
    ]);
    expect(players[0]!.initials).toBe("A");
  });

  it("handles a lobby with no members", () => {
    expect(playersOf({ hostId: "h" })).toEqual([]);
    expect(playerName({ hostId: "h" }, "x")).toBe("Someone");
  });
});

describe("isPlayerDone", () => {
  it("means picked the full quota while picking, and voted while voting", () => {
    const picking = lobby({ picks: { host: { "1": { title: "A" }, "2": { title: "B" } }, guest: { "1": { title: "A" } } } });
    expect(isPlayerDone(picking, "host")).toBe(true);
    expect(isPlayerDone(picking, "guest")).toBe(false);

    const voting = lobby({ stage: "VOTING", votes: { guest: "1" } });
    expect(isPlayerDone(voting, "guest")).toBe(true);
    expect(isPlayerDone(voting, "host")).toBe(false);
  });
});

describe("names", () => {
  it("cleans whitespace and caps length without splitting emoji", () => {
    expect(cleanName("  Sam   the   Man ")).toBe("Sam the Man");
    expect(cleanName("x".repeat(40))).toHaveLength(24);
    const emoji = cleanName("🍿".repeat(20));
    expect(emoji.length).toBeLessThanOrEqual(24);
    expect(emoji).toBe("🍿".repeat(12));
  });

  it("makes initials from up to two words", () => {
    expect(initialsOf("sam jones smith")).toBe("SJ");
    expect(initialsOf("🍿 fan")).toBe("🍿F");
    expect(initialsOf("   ")).toBe("?");
  });

  it("gives each player a stable color", () => {
    expect(colorFor("abc")).toBe(colorFor("abc"));
    expect(colorFor("abc")).toMatch(/^#[0-9a-f]{6}$/);
  });

  it("remembers the player's name between visits", () => {
    expect(loadSavedName()).toBe("");
    saveName("Sam");
    expect(loadSavedName()).toBe("Sam");
  });
});
