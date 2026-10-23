import { afterEach, describe, expect, it } from "vitest";
import { forgetLobby, recentLobbies, rememberLobby } from "./recentLobbies";

afterEach(() => localStorage.clear());

describe("recent lobbies", () => {
  it("keeps the last four, most recent first, without duplicates", () => {
    for (const code of ["AAAAAA", "BBBBBB", "CCCCCC", "DDDDDD", "EEEEEE"]) rememberLobby(code);
    rememberLobby("CCCCCC");
    expect(recentLobbies()).toEqual(["CCCCCC", "EEEEEE", "DDDDDD", "BBBBBB"]);
  });

  it("forgets lobbies that no longer exist", () => {
    rememberLobby("AAAAAA");
    rememberLobby("BBBBBB");
    forgetLobby("AAAAAA");
    expect(recentLobbies()).toEqual(["BBBBBB"]);
  });

  it("ignores corrupted storage", () => {
    localStorage.setItem("wsww:recent-lobbies", "{not json");
    expect(recentLobbies()).toEqual([]);
    localStorage.setItem("wsww:recent-lobbies", JSON.stringify(["ok", 5, "ABC234"]));
    expect(recentLobbies()).toEqual(["ABC234"]);
  });
});
