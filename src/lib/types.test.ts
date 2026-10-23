import { describe, expect, it } from "vitest";
import { isLobby } from "./types";

const v2 = {
  hostId: "host",
  createdAt: 1,
  settings: { numMovies: 2, unlimitedVotes: false },
  stage: "PICKING",
  members: { host: 1 },
};

describe("isLobby", () => {
  it("accepts lobbies written by this version", () => {
    expect(isLobby(v2)).toBe(true);
    expect(isLobby({ ...v2, stage: "DONE" })).toBe(true);
  });

  it("rejects v1 lobbies still in the live database", () => {
    // Shape written by the 2022 client (src/Services/LobbyService.js in git history).
    const v1 = {
      users: { abc: { isAdmin: true, donePicking: false } },
      unlimitedVotes: false,
      numMovies: "2",
      stage: "PICKING",
      totalVotes: 0,
    };
    expect(isLobby(v1)).toBe(false);
    expect(isLobby({ ...v2, stage: "VETO" })).toBe(false);
  });

  it("rejects non-objects and partial settings", () => {
    expect(isLobby(null)).toBe(false);
    expect(isLobby("lobby")).toBe(false);
    expect(isLobby({ ...v2, settings: { numMovies: 2 } })).toBe(false);
  });
});
