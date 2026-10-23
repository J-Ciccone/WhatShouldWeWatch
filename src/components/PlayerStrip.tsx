import { Check, Crown, Pencil } from "lucide-react";
import { isPlayerDone, playersOf } from "../lib/players";
import type { Lobby } from "../lib/types";
import { Avatar } from "./ui/Avatar";

interface Props {
  lobby: Lobby;
  uid: string;
  onRename: () => void;
}

const DONE_LABEL = { PICKING: "picked", VOTING: "voted", DONE: "" } as const;

/** Everyone in the lobby, with who's done with the current step. */
export function PlayerStrip({ lobby, uid, onRename }: Props) {
  const players = playersOf(lobby);
  const showDone = lobby.stage !== "DONE";

  return (
    <ul className="player-strip" aria-label="Players">
      {players.map((p) => {
        const done = showDone && isPlayerDone(lobby, p.uid);
        const content = (
          <>
            <Avatar player={p} />
            <span>
              {p.name}
              {p.uid === uid && <span className="muted"> (you)</span>}
            </span>
            {p.isHost && (
              <span className="host-crown" title="Host">
                <Crown size={15} aria-label="host" />
              </span>
            )}
            {done && (
              <span className="status" title={`Has ${DONE_LABEL[lobby.stage]}`}>
                <Check size={16} aria-label={DONE_LABEL[lobby.stage]} />
              </span>
            )}
            {p.uid === uid && <Pencil size={13} className="muted" aria-hidden="true" />}
          </>
        );
        return (
          <li key={p.uid}>
            {p.uid === uid ? (
              <button
                type="button"
                className={`player ${done ? "is-done" : ""}`}
                onClick={onRename}
                aria-label={`${p.name} (you). Change your name`}
              >
                {content}
              </button>
            ) : (
              <span className={`player ${done ? "is-done" : ""}`}>{content}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
