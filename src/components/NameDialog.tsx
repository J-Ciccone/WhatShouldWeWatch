import { useState, type FormEvent, type ReactNode } from "react";
import { cleanName } from "../lib/players";
import { MAX_NAME_LENGTH } from "../lib/types";
import { Dialog } from "./ui/Dialog";

interface Props {
  open: boolean;
  initialName: string;
  title: string;
  submitLabel: string;
  onSubmit: (name: string) => void;
  /** Omit to require a name before continuing. */
  onClose?: () => void;
  busy?: boolean;
  children?: ReactNode;
}

export function NameDialog({ open, initialName, title, submitLabel, onSubmit, onClose, busy, children }: Props) {
  const [name, setName] = useState(initialName);
  const cleaned = cleanName(name);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (cleaned) onSubmit(cleaned);
  };

  return (
    <Dialog open={open} onClose={onClose} title={title}>
      <form onSubmit={submit} className="setup" style={{ margin: 0 }}>
        <div className="field">
          <label className="field-label" htmlFor="player-name">
            Your name
          </label>
          <input
            id="player-name"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={MAX_NAME_LENGTH + 8}
            placeholder="e.g. Sam"
            autoComplete="nickname"
            autoFocus
          />
          <span className="muted small">This is how your friends will see you.</span>
        </div>
        {children}
        <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={!cleaned || busy}>
          {submitLabel}
        </button>
      </form>
    </Dialog>
  );
}
