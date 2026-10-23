import { afterEach, describe, expect, it, vi } from "vitest";
import { imageUrl, movieExtras, searchMovies, TmdbError, toMovie, trendingMovies, userRegion } from "./tmdb";

afterEach(() => vi.unstubAllGlobals());

function stubFetch(response: Response) {
  const fetchMock = vi.fn().mockResolvedValue(response);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

const json = (body: unknown) => new Response(JSON.stringify(body));

describe("toMovie", () => {
  it("maps TMDB fields and drops missing ones (Firebase rejects null)", () => {
    expect(
      toMovie({
        id: 348,
        title: "Alien",
        release_date: "1979-05-25",
        poster_path: "/a.jpg",
        backdrop_path: "/b.jpg",
        overview: "Space.",
        vote_average: 8.137,
        vote_count: 1000,
      }),
    ).toEqual({
      id: "348",
      title: "Alien",
      year: "1979",
      posterPath: "/a.jpg",
      backdropPath: "/b.jpg",
      overview: "Space.",
      rating: 8.1,
    });

    expect(
      toMovie({ id: 1, title: "Untitled", release_date: "", poster_path: null, backdrop_path: null, overview: "" }),
    ).toEqual({ id: "1", title: "Untitled" });
  });

  it("leaves out the rating when nobody has rated it", () => {
    expect(toMovie({ id: 1, title: "New", vote_average: 0, vote_count: 0 }).rating).toBeUndefined();
    expect(toMovie({ id: 1, title: "New", vote_average: 6, vote_count: 0 }).rating).toBeUndefined();
  });

  it("caps very long overviews to what the rules allow", () => {
    expect(toMovie({ id: 1, title: "Long", overview: "x".repeat(5000) }).overview).toHaveLength(2000);
  });
});

describe("imageUrl", () => {
  it("builds an image URL, or nothing without a path", () => {
    expect(imageUrl("/a.jpg")).toBe("https://image.tmdb.org/t/p/w342/a.jpg");
    expect(imageUrl("/a.jpg", "w92")).toBe("https://image.tmdb.org/t/p/w92/a.jpg");
    expect(imageUrl(undefined)).toBeUndefined();
  });
});

describe("searchMovies", () => {
  it("sends the bearer token and an encoded query", async () => {
    const fetchMock = stubFetch(json({ results: [{ id: 603, title: "The Matrix", release_date: "1999-03-31" }] }));
    const results = await searchMovies("the matrix & co", { token: "tkn" });

    expect(results).toEqual([{ id: "603", title: "The Matrix", year: "1999" }]);
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(String(url)).toContain("/search/movie?");
    expect(String(url)).toContain("query=the+matrix+%26+co");
    expect(String(url)).toContain("include_adult=false");
    expect(init.headers.Authorization).toBe("Bearer tkn");
  });

  it("returns nothing for a blank query without calling the API", async () => {
    const fetchMock = stubFetch(json({}));
    expect(await searchMovies("   ", { token: "tkn" })).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("treats a missing results array as no results", async () => {
    stubFetch(json({}));
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

describe("trendingMovies", () => {
  it("loads this week's trending movies", async () => {
    const fetchMock = stubFetch(json({ results: [{ id: 1, title: "Hit" }] }));
    expect(await trendingMovies({ token: "tkn" })).toEqual([{ id: "1", title: "Hit" }]);
    expect(String(fetchMock.mock.calls[0]![0])).toContain("/trending/movie/week");
  });
});

describe("movieExtras", () => {
  it("picks the official YouTube trailer and the region's providers in one request", async () => {
    const fetchMock = stubFetch(
      json({
        videos: {
          results: [
            { key: "teaser", site: "YouTube", type: "Teaser" },
            { key: "vimeo", site: "Vimeo", type: "Trailer", official: true },
            { key: "fan", site: "YouTube", type: "Trailer", official: false },
            { key: "real", site: "YouTube", type: "Trailer", official: true },
          ],
        },
        "watch/providers": {
          results: {
            GB: {
              link: "https://tmdb/watch",
              flatrate: [{ provider_id: 8, provider_name: "Netflix", logo_path: "/n.jpg" }],
              free: [{ provider_id: 8, provider_name: "Netflix", logo_path: "/n.jpg" }],
              ads: [{ provider_id: 300, provider_name: "Pluto TV", logo_path: null }],
              rent: [{ provider_id: 2, provider_name: "Apple TV", logo_path: "/a.jpg" }],
            },
            US: { flatrate: [{ provider_id: 9, provider_name: "Prime", logo_path: "/p.jpg" }] },
          },
        },
      }),
    );

    const extras = await movieExtras("348", "GB", { token: "tkn" });

    expect(String(fetchMock.mock.calls[0]![0])).toContain("/movie/348?append_to_response=videos%2Cwatch%2Fproviders");
    expect(extras.trailerUrl).toBe("https://www.youtube.com/watch?v=real");
    expect(extras.watch).toEqual({
      link: "https://tmdb/watch",
      stream: [
        { id: 8, name: "Netflix", logoPath: "/n.jpg" },
        { id: 300, name: "Pluto TV" },
      ],
      rent: [{ id: 2, name: "Apple TV", logoPath: "/a.jpg" }],
      buy: [],
    });
  });

  it("copes with no trailer and no providers in the region", async () => {
    stubFetch(json({ videos: { results: [] }, "watch/providers": { results: {} } }));
    expect(await movieExtras("1", "US", { token: "tkn" })).toEqual({ watch: { stream: [], rent: [], buy: [] } });
  });
});

describe("userRegion", () => {
  it("reads the region from the browser language", () => {
    expect(userRegion("en-GB")).toBe("GB");
    expect(userRegion("pt_br")).toBe("BR");
    expect(userRegion("zh-Hant-TW")).toBe("TW");
  });

  it("falls back to US without a region", () => {
    expect(userRegion("fr")).toBe("US");
    expect(userRegion("")).toBe("US");
    expect(userRegion(undefined)).toBe("US");
  });
});
