import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { CODE_LENGTH, isValidLobbyCode, normalizeLobbyCode } from "../lib/lobbyCode";

export function HomePage() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const normalized = normalizeLobbyCode(code);
  const valid = isValidLobbyCode(normalized);

  const join = (e: FormEvent) => {
    e.preventDefault();
    if (valid) navigate(`/lobby/${normalized}`);
  };

  return (
    <div className="intro">
      <div className="intro-bg" aria-hidden="true" />
      <div className="intro-content">
        <h1 className="intro-title">What Should We Watch?</h1>
        <p className="intro-tagline">
          <em>Movie night has never been so easy</em>
        </p>
        <div className="intro-actions">
          <Link to="/new" className="btn btn-primary btn-lg start-vote-button">
            Start New Vote
          </Link>
          <span className="intro-or">OR</span>
          <form onSubmit={join} className="join-form">
            <label htmlFor="lobby-code" className="form-label">
              Enter a lobby code to join a vote in progress
            </label>
            <div className="input-group">
              <input
                id="lobby-code"
                className="form-control pill-input"
                placeholder="Lobby code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={CODE_LENGTH + 4}
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
              />
              <button className="btn btn-primary pill-input-button" type="submit" disabled={!valid}>
                Join
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
