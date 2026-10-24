import { describe, expect, it } from "vitest";
import { finalWinners, moviePool, pickRandom, tally, voterCount, votesOf, winners } from "./tally";
import type { Lobby } from "./types";

const alien = { title: "Alien", year: "1979" };
const matrix = { title: "The Matrix" };
const heat = { title: "Heat" };

const picks: Lobby["picks"] = {
  ann: { "348": alien, "603": matrix },
  bob: { "603": matrix, "949": heat },
};

describe("moviePool", () => {
  it("merges everyone's picks, tracking who picked each movie", () => {
    const pool = moviePool({ picks });
    expect(pool.map((p) => p.movie.title)).toEqual(["Alien", "Heat", "The Matrix"]);
    expect(pool.find((p) => p.movie.id === "603")!.pickedBy.sort()).toEqual(["ann", "bob"]);
  });

  it("keeps a movie when one of the people who picked it removes it", () => {
    // Regression: the old shared "added" counter could delete a movie someone else still wanted.
    const pool = moviePool({ picks: { ann: { "348": alien }, bob: { "603": matrix } } });
    expect(pool.map((p) => p.movie.id).sort()).toEqual(["348", "603"]);
  });

  it("fills in missing details from other people's copies of the same pick", () => {
    const pool = moviePool({
      picks: { ann: { "578": { title: "Jaws" } }, bob: { "578": { title: "Jaws", posterPath: "/j.jpg", rating: 7.7 } } },
    });
    expect(pool[0]!.movie).toEqual({ id: "578", title: "Jaws", posterPath: "/j.jpg", rating: 7.7 });
  });

  it("handles a lobby with no picks", () => {
    expect(moviePool({})).toEqual([]);
  });
});

describe("votesOf", () => {
  it("reads both the single-vote and unlimited-vote shapes", () => {
    const votes = { ann: "348", bob: { "603": true as const, "949": true as const } };
    expect(votesOf({ votes }, "ann")).toEqual(["348"]);
    expect(votesOf({ votes }, "bob").sort()).toEqual(["603", "949"]);
    expect(votesOf({ votes }, "nobody")).toEqual([]);
  });
});

describe("tally and winners", () => {
  it("counts votes and ignores votes for movies nobody picked", () => {
    const lobby = { picks, votes: { ann: "603", bob: "603", cat: "348", dan: "999999" } };
    const counts = Object.fromEntries(tally(lobby).map((t) => [t.movie.id, t.votes]));
    expect(counts).toEqual({ "348": 1, "603": 2, "949": 0 });
    expect(winners(lobby).map((w) => w.movie.title)).toEqual(["The Matrix"]);
  });

  it("reports every tied movie instead of picking one arbitrarily", () => {
    const lobby = { picks, votes: { ann: "603", bob: "348" } };
    expect(winners(lobby).map((w) => w.movie.title)).toEqual(["Alien", "The Matrix"]);
  });

  it("counts each movie once per person in unlimited mode", () => {
    const lobby = { picks, votes: { ann: { "348": true as const, "603": true as const }, bob: { "603": true as const } } };
    expect(winners(lobby).map((w) => [w.movie.id, w.votes])).toEqual([["603", 2]]);
  });

  it("returns every movie with zero votes when nobody voted, and nothing for an empty lobby", () => {
    expect(winners({ picks }).every((w) => w.votes === 0)).toBe(true);
    expect(winners({})).toEqual([]);
  });

  it("applies the host's tie-break only to an actual tie", () => {
    const tied = { picks, votes: { ann: "603", bob: "348" } };
    expect(finalWinners({ ...tied, tiebreak: "348" }).map((w) => w.movie.id)).toEqual(["348"]);
    // A tie-break naming a movie that isn't among the tied ones is ignored.
    expect(finalWinners({ ...tied, tiebreak: "949" })).toHaveLength(2);
    // Without a tie, the tie-break doesn't override the real winner.
    expect(finalWinners({ picks, votes: { ann: "603" }, tiebreak: "348" }).map((w) => w.movie.id)).toEqual(["603"]);
  });

  it("uses the random pick when the vote was skipped", () => {
    expect(finalWinners({ picks, randomPick: { movieId: "949", pickedBy: "bob" } }).map((w) => w.movie.id)).toEqual(["949"]);
    // A random pick that isn't in the pool is ignored.
    expect(finalWinners({ picks, randomPick: { movieId: "999999", pickedBy: "bob" } })).toHaveLength(3);
  });

  it("picks every option eventually and never one outside the list", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 300; i++) seen.add(pickRandom(["a", "b", "c"]));
    expect([...seen].sort()).toEqual(["a", "b", "c"]);
    expect(() => pickRandom([])).toThrow();
  });

  it("counts people who voted", () => {
    expect(voterCount({ votes: { ann: "348", bob: { "603": true } } })).toBe(2);
    expect(voterCount({})).toBe(0);
  });
});
