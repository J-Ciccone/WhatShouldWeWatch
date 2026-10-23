import { afterEach, describe, expect, it, vi } from "vitest";
import { clearReloadFlag, isChunkLoadError, reloadOnceForUpdate } from "./reloadOnce";

afterEach(() => sessionStorage.clear());

describe("reloading after a deploy", () => {
  it("recognises missing-chunk errors from the main browsers", () => {
    expect(isChunkLoadError(new TypeError("Failed to fetch dynamically imported module: /assets/x.js"))).toBe(true);
    expect(isChunkLoadError(new TypeError("Importing a module script failed."))).toBe(true);
    expect(isChunkLoadError(new TypeError("error loading dynamically imported module"))).toBe(true);
    expect(isChunkLoadError(new Error("Cannot read properties of undefined"))).toBe(false);
  });

  it("reloads once, then stops so a real outage can't loop", () => {
    const reload = vi.fn();
    expect(reloadOnceForUpdate(reload)).toBe(true);
    expect(reloadOnceForUpdate(reload)).toBe(false);
    expect(reload).toHaveBeenCalledTimes(1);

    clearReloadFlag();
    expect(reloadOnceForUpdate(reload)).toBe(true);
  });
});
