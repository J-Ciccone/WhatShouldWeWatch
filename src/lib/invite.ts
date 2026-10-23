export function inviteUrl(code: string, origin = window.location.origin) {
  return `${origin}/lobby/${code}`;
}

/**
 * Opens the phone's share sheet where there is one, otherwise copies the link.
 * Returns what happened so the caller can tell the user.
 */
export async function shareInvite(code: string): Promise<"shared" | "copied" | "cancelled" | "failed"> {
  const url = inviteUrl(code);
  if (typeof navigator.share === "function") {
    try {
      await navigator.share({ title: "What Should We Watch?", text: `Join our movie vote! Code ${code}`, url });
      return "shared";
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return "cancelled";
      // Some browsers expose share() but refuse it (e.g. desktop without a target); fall back to copying.
    }
  }
  try {
    await navigator.clipboard.writeText(url);
    return "copied";
  } catch {
    return "failed";
  }
}
