import type { CSSProperties } from "react";
import type { Player } from "../../lib/players";

export function Avatar({ player, size = "md" }: { player: Player; size?: "sm" | "md" }) {
  return (
    <span
      className={`avatar ${size === "sm" ? "avatar-sm" : ""}`}
      style={{ "--avatar-color": player.color } as CSSProperties}
      title={player.name}
      aria-hidden="true"
    >
      {player.initials}
    </span>
  );
}

/** Overlapping avatars, e.g. everyone who picked the same movie. */
export function AvatarStack({ players, max = 4 }: { players: Player[]; max?: number }) {
  const shown = players.slice(0, max);
  return (
    <span className="avatar-stack" aria-label={players.map((p) => p.name).join(", ")} role="img">
      {shown.map((p) => (
        <Avatar key={p.uid} player={p} size="sm" />
      ))}
      {players.length > max && <span className="muted small">&nbsp;+{players.length - max}</span>}
    </span>
  );
}
