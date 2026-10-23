const KEY = "wsww:reloaded-for-update";

/** True for the errors browsers throw when a lazy-loaded chunk can't be fetched. */
export function isChunkLoadError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /dynamically imported module|Importing a module script failed|error loading dynamically imported|Failed to fetch dynamically/i.test(
    message,
  );
}

/**
 * After a deploy, an open tab may ask for code files that no longer exist.
 * Reloading picks up the new version; the flag stops a reload loop if the
 * failure is something else (e.g. offline).
 */
export function reloadOnceForUpdate(reload: () => void = () => window.location.reload()): boolean {
  try {
    if (sessionStorage.getItem(KEY)) return false;
    sessionStorage.setItem(KEY, "1");
  } catch {
    return false;
  }
  reload();
  return true;
}

/** Call once the app has loaded fine, so a later deploy can reload again. */
export function clearReloadFlag() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // Nothing to clear.
  }
}
