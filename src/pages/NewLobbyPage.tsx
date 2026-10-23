import { CheckCheck, ChevronRight, CircleCheck } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { useUid } from "../auth/AuthContext";
import { cleanName, loadSavedName, saveName } from "../lib/players";
import { MAX_NAME_LENGTH, MOVIES_PER_PERSON_OPTIONS } from "../lib/types";
import { createLobby } from "../services/lobby";

export function NewLobbyPage() {
  const uid = useUid();
  const navigate = useNavigate();
  const [name, setName] = useState(loadSavedName);
  const [numMovies, setNumMovies] = useState<number>(3);
  const [unlimitedVotes, setUnlimitedVotes] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cleaned = cleanName(name);

  const start = async (e: FormEvent) => {
    e.preventDefault();
    if (!cleaned) return;
    setCreating(true);
    setError(null);
    saveName(cleaned);
    try {
      const code = await createLobby(uid, { numMovies, unlimitedVotes }, cleaned);
      navigate(`/lobby/${code}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't create the lobby.");
      setCreating(false);
    }
  };

  return (
    <form className="setup" onSubmit={start}>
      <div>
        <p className="eyebrow">New movie night</p>
        <h2>Let's set things up</h2>
      </div>

      <div className="field">
        <label className="field-label" htmlFor="host-name">
          Your name
        </label>
        <input
          id="host-name"
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={MAX_NAME_LENGTH + 8}
          placeholder="e.g. Sam"
          autoComplete="nickname"
          required
        />
      </div>

      <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="field-label" style={{ marginBottom: "0.4rem" }}>
          Movies each person picks
        </legend>
        <div className="segmented">
          {MOVIES_PER_PERSON_OPTIONS.map((n) => (
            <label key={n}>
              <input
                type="radio"
                name="num-movies"
                value={n}
                checked={numMovies === n}
                onChange={() => setNumMovies(n)}
              />
              <span>{n}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="field-label" style={{ marginBottom: "0.4rem" }}>
          How voting works
        </legend>
        <div className="choice-cards">
          <label className="choice-card">
            <input type="radio" name="vote-mode" checked={!unlimitedVotes} onChange={() => setUnlimitedVotes(false)} />
            <CircleCheck size={22} aria-hidden="true" />
            <span>
              <strong>One vote each</strong>
              <span className="muted small">Everyone backs their favourite.</span>
            </span>
          </label>
          <label className="choice-card">
            <input type="radio" name="vote-mode" checked={unlimitedVotes} onChange={() => setUnlimitedVotes(true)} />
            <CheckCheck size={22} aria-hidden="true" />
            <span>
              <strong>Vote for any</strong>
              <span className="muted small">Pick everything you'd watch. Great for big groups.</span>
            </span>
          </label>
        </div>
      </fieldset>

      {error && (
        <div className="alert" role="alert">
          {error}
        </div>
      )}

      <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={!cleaned || creating}>
        {creating ? "Creating lobby…" : "Create lobby"} {!creating && <ChevronRight size={20} />}
      </button>
    </form>
  );
}
