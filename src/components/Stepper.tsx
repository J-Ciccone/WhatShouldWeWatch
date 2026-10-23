import { Check, Film, Popcorn, Vote } from "lucide-react";
import { STAGES, type Stage } from "../lib/types";

const STEPS: Record<Stage, { label: string; Icon: typeof Film }> = {
  PICKING: { label: "Pick", Icon: Film },
  VOTING: { label: "Vote", Icon: Vote },
  DONE: { label: "Watch", Icon: Popcorn },
};

export function Stepper({ stage }: { stage: Stage }) {
  const current = STAGES.indexOf(stage);
  return (
    <ol className="stepper" aria-label="Progress">
      {STAGES.map((s, i) => {
        const { label, Icon } = STEPS[s];
        const state = i < current ? "is-past" : i === current ? "is-current" : "";
        return (
          <li key={s} className={state} aria-current={i === current ? "step" : undefined}>
            <span className="dot" aria-hidden="true">
              {i < current ? <Check size={16} /> : <Icon size={16} />}
            </span>
            {label}
          </li>
        );
      })}
    </ol>
  );
}
