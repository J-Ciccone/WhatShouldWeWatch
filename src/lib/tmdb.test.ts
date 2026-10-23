import { afterEach, describe, expect, it, vi } from "vitest";
import { posterUrl, searchMovies, TmdbError, toMovie } from "./tmdb";

afterEach(() => vi.unstubAllGlobals());

function stubFetch(response: Response) {
  const fetchMock = vi.fn().mockResolvedValue(response);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("toMovie", () => {
  it("maps TMDB fields and drops missing ones (Firebase rejects null)", () => {
    expect(
      toMovie({ id: 348, title: "Alien", release_date: "1979-05-25", poster_path: "/a.jpg", overview: "Space." }),
    ).toEqual({ id: "348", title: "Alien", year: "1979", posterPath: "/a.jpg", overview: "Space." });

    expect(toMovie({ id: 1, title: "Untitled", release_date: "", poster_path: null, overview: "" })).toEqual({
      id: "1",
      title: "Untitled",
    });
  });

  it("caps very long overviews to what the rules allow", () => {
    expect(toMovie({ id: 1, title: "Long", overview: "x".repeat(5000) }).overview).toHaveLength(2000);
  });
});

describe("posterUrl", () => {
  it("builds an image URL, or nothing without a poster", () => {
    expect(posterUrl("/a.jpg")).toBe("https://image.tmdb.org/t/p/w342/a.jpg");
    expect(posterUrl(undefined)).toBeUndefined();
  });
});

describe("searchMovies", () => {
  it("sends the bearer token and an encoded query", async () => {
    const fetchMock = stubFetch(
      new Response(JSON.stringify({ results: [{ id: 603, title: "The Matrix", release_date: "1999-03-31" }] })),
    );
    const results = await searchMovies("the matrix & co", { token: "tkn" });

    expect(results).toEqual([{ id: "603", title: "The Matrix", year: "1999" }]);
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(String(url)).toContain("query=the+matrix+%26+co");
    expect(String(url)).toContain("include_adult=false");
    expect(init.headers.Authorization).toBe("Bearer tkn");
  });

  it("returns nothing for a blank query without calling the API", async () => {
    const fetchMock = stubFetch(new Response("{}"));
    expect(await searchMovies("   ", { token: "tkn" })).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("treats a missing results array as no results", async () => {
    stubFetch(new Response(JSON.stringify({})));
    expect(await searchMovies("x", { token: "tkn" })).toEqual([]);
  });

  it("throws a readable error on HTTP failures and missing config", async () => {
    stubFetch(new Response("nope", { status: 401 }));
    await expect(searchMovies("x", { token: "bad" })).rejects.toThrow(TmdbError);

    stubFetch(new Response("slow down", { status: 429 }));
    await expect(searchMovies("x", { token: "tkn" })).rejects.toThrow(/Too many searches/);

    await expect(searchMovies("x", { token: "" })).rejects.toThrow(/isn't configured/);
  });
});
