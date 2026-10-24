import { ChevronRight, Film, KeyRound, Popcorn, Users, Vote } from "lucide-react";
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
  const [entering, setEntering] = useState(false);
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
        <p className="eyebrow" style={{ margin: 0 }}>
          Movie night, sorted
        </p>
        <h1 className="hero-title">
          What should we <em>watch?</em>
        </h1>
        <p className="hero-tagline">
          Everyone picks a few movies, you all vote, and tonight's winner is on screen in minutes.
        </p>

        <div className="hero-cta">
          <Link to="/new" className="btn btn-primary btn-lg">
            <Popcorn size={20} /> Host a movie night
          </Link>

          {/* The code field only appears once someone says they have a code. */}
          {entering ? (
            <form className="join-inline" onSubmit={join}>
              <label htmlFor="lobby-code" className="visually-hidden">
                Enter the code, or paste the invite link
              </label>
              <input
                id="lobby-code"
                className="input code-input"
                placeholder="Code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape" && !code) setEntering(false);
                }}
                maxLength={200}
                autoComplete="off"
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
                enterKeyHint="go"
                autoFocus
              />
              <button className="btn btn-primary" type="submit" disabled={!valid}>
                Join <ChevronRight size={18} />
              </button>
            </form>
          ) : (
            <button type="button" className="btn btn-lg btn-frost" onClick={() => setEntering(true)}>
              <KeyRound size={20} /> Enter a code
            </button>
          )}

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
        </div>
      </section>

      <section aria-labelledby="how-heading">
        <h3 id="how-heading" className="visually-hidden">
          How it works
        </h3>
        <ol className="how-steps">
          {STEPS.map(({ Icon, title, text }) => (
            <li key={title}>
              <span className="step-icon" aria-hidden="true">
                <Icon size={22} />
              </span>
              <strong>{title}</strong>
              <span className="text">{text}</span>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
