import { ChevronRight, Film, LogIn, Popcorn, Users, Vote } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { isValidLobbyCode, normalizeLobbyCode } from "../lib/lobbyCode";
import { recentLobbies } from "../lib/recentLobbies";

const STEPS = [
  { Icon: Users, title: "Start a lobby", text: "Share the code or QR with your friends. No sign-up needed." },
  { Icon: Film, title: "Everyone picks", text: "Search or browse what's popular and add a few favourites." },
  { Icon: Vote, title: "Vote together", text: "The results appear when the host hits reveal." },
  { Icon: Popcorn, title: "Press play", text: "See the winner, the trailer, and where it's streaming." },
];

export function HomePage() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [recent] = useState(recentLobbies);
  const normalized = normalizeLobbyCode(code);
  const valid = isValidLobbyCode(normalized);

  const join = (e: FormEvent) => {
    e.preventDefault();
    if (valid) navigate(`/lobby/${normalized}`);
  };

  return (
    <>
      <div className="hero-bg" aria-hidden="true" />
      <section className="hero">
        <div>
          <p className="eyebrow">Movie night, sorted</p>
          <h1 className="hero-title">
            What should we <em>watch?</em>
          </h1>
          <p className="hero-tagline">
            Everyone picks a few movies, you all vote, and tonight's winner is on screen in minutes.
          </p>
        </div>

        <div className="hero-actions">
          <div className="card action-card">
            <h3>Host a movie night</h3>
            <p className="muted" style={{ margin: 0 }}>
              Create a lobby and invite your friends.
            </p>
            <Link to="/new" className="btn btn-primary btn-lg">
              Start a vote <ChevronRight size={20} />
            </Link>
          </div>

          <form className="card action-card" onSubmit={join}>
            <h3>Join your friends</h3>
            <label htmlFor="lobby-code" className="muted">
              Enter the code, or paste the invite link.
            </label>
            <input
              id="lobby-code"
              className="input code-input"
              placeholder="ABC123"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={200}
              autoComplete="off"
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="go"
            />
            <button className="btn btn-lg" type="submit" disabled={!valid}>
              <LogIn size={20} /> Join
            </button>
          </form>
        </div>

        {recent.length > 0 && (
          <div className="recent">
            <span className="muted small">Jump back in:</span>
            {recent.map((c) => (
              <Link key={c} to={`/lobby/${c}`} className="chip chip-code">
                {c}
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="section" aria-labelledby="how-heading">
        <h3 id="how-heading">How it works</h3>
        <ol className="how-it-works">
          {STEPS.map(({ Icon, title, text }) => (
            <li key={title}>
              <span className="step-icon" aria-hidden="true">
                <Icon size={22} />
              </span>
              <span>
                <strong>{title}</strong>
                <span className="muted small">{text}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
