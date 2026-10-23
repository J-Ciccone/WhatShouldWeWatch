import type { CSSProperties } from "react";

const COLORS = ["#ff753b", "#f4b740", "#3ecf8e", "#38bdf8", "#a78bfa", "#f472b6"];
const PIECES = 90;

// Deterministic "random" numbers so rendering stays pure and every viewer
// gets the same burst.
function noise(i: number, salt: number) {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

const pieces = Array.from({ length: PIECES }, (_, i) => ({
  left: `${noise(i, 1) * 100}%`,
  background: COLORS[i % COLORS.length],
  "--delay": `${noise(i, 2) * 0.6}s`,
  "--dur": `${2.2 + noise(i, 3) * 1.8}s`,
  "--drift": `${(noise(i, 4) - 0.5) * 240}px`,
  "--spin": `${(noise(i, 5) - 0.5) * 1440}deg`,
})) as CSSProperties[];

/** A one-off burst of falling confetti. Hidden for people who prefer reduced motion. */
export function Confetti() {
  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((style, i) => (
        <i key={i} style={style} />
      ))}
    </div>
  );
}
