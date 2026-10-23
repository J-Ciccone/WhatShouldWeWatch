import { useEffect, useState } from "react";
import type { Lobby } from "../lib/types";
import { subscribeToLobby } from "../services/lobby";

export type LobbyState =
  | { status: "loading" }
  | { status: "missing" }
  | { status: "error"; error: Error }
  | { status: "ready"; lobby: Lobby };

/** Live view of lobbies/{code}. */
export function useLobby(code: string): LobbyState {
  // Remember which code a result belongs to, so switching codes shows "loading"
  // instead of the previous lobby.
  const [state, setState] = useState<{ code: string; value: LobbyState } | null>(null);

  useEffect(
    () =>
      subscribeToLobby(
        code,
        (lobby) => setState({ code, value: lobby ? { status: "ready", lobby } : { status: "missing" } }),
        (error) => setState({ code, value: { status: "error", error } }),
      ),
    [code],
  );

  return state?.code === code ? state.value : { status: "loading" };
}
