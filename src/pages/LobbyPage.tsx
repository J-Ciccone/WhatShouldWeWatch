import { useEffect, useRef, useState } from "react";
import { Button, Spinner } from "react-bootstrap";
import { Link, Navigate, useParams } from "react-router";
import { useUid } from "../auth/AuthContext";
import { PickingStage } from "../components/PickingStage";
import { ResultsStage } from "../components/ResultsStage";
import { VotingStage } from "../components/VotingStage";
import { useLobby } from "../hooks/useLobby";
import { isValidLobbyCode, normalizeLobbyCode } from "../lib/lobbyCode";
import { joinLobby } from "../services/lobby";

export function LobbyPage() {
  const raw = useParams().code ?? "";
  const code = normalizeLobbyCode(raw);
  if (!isValidLobbyCode(code)) return <LobbyNotFound code={raw} />;
  if (code !== raw) return <Navigate to={`/lobby/${code}`} replace />;
  return <LobbyView key={code} code={code} />;
}

function LobbyView({ code }: { code: string }) {
  const uid = useUid();
  const state = useLobby(code);
  const [joinError, setJoinError] = useState<string | null>(null);
  const joinRequested = useRef(false);

  const lobby = state.status === "ready" ? state.lobby : null;
  const isMember = Boolean(lobby?.members?.[uid]);
  // Anyone opening the link joins automatically, unless the vote is already over.
  const needsJoin = lobby !== null && !isMember && lobby.stage !== "DONE";

  useEffect(() => {
    if (!needsJoin || joinRequested.current) return;
    joinRequested.current = true;
    joinLobby(code, uid).catch((err: Error) => {
      joinRequested.current = false;
      setJoinError(err.message);
    });
  }, [needsJoin, code, uid]);

  if (state.status === "loading") return <CenteredSpinner label="Loading lobby…" />;
  if (state.status === "missing") return <LobbyNotFound code={code} />;
  if (state.status === "error") {
    return (
      <div className="centered-message">
        <h2>Couldn't load this lobby</h2>
        <p>{state.error.message}</p>
        <Link to="/" className="btn btn-primary">
          Back to home
        </Link>
      </div>
    );
  }

  const { lobby: current } = state;
  return (
    <div className="lobby">
      <LobbyHeader code={code} playerCount={Object.keys(current.members ?? {}).length} />
      {joinError && (
        <div className="alert alert-danger" role="alert">
          Couldn't join this lobby: {joinError}
        </div>
      )}
      {current.stage === "PICKING" && <PickingStage code={code} lobby={current} uid={uid} canAct={isMember} />}
      {current.stage === "VOTING" && <VotingStage code={code} lobby={current} uid={uid} canAct={isMember} />}
      {current.stage === "DONE" && <ResultsStage lobby={current} />}
    </div>
  );
}

function LobbyHeader({ code, playerCount }: { code: string; playerCount: number }) {
  const [copied, setCopied] = useState(false);

  const copyInvite = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/lobby/${code}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked (e.g. insecure context); the code is on screen anyway.
    }
  };

  return (
    <div className="lobby-header">
      <h2 className="mb-0">
        Lobby code: <span className="lobby-code">{code}</span>
      </h2>
      <div className="lobby-header-meta">
        <span>
          {playerCount} {playerCount === 1 ? "player" : "players"}
        </span>
        <Button size="sm" variant="secondary" onClick={copyInvite}>
          <span className="material-symbols-outlined icon-inline" aria-hidden="true">
            {copied ? "check" : "link"}
          </span>{" "}
          {copied ? "Copied!" : "Copy invite link"}
        </Button>
      </div>
    </div>
  );
}

function LobbyNotFound({ code }: { code: string }) {
  return (
    <div className="centered-message">
      <h2>Lobby not found</h2>
      <p>
        There's no vote with the code <strong>{code}</strong>. Check the code and try again.
      </p>
      <Link to="/" className="btn btn-primary">
        Back to home
      </Link>
    </div>
  );
}

function CenteredSpinner({ label }: { label: string }) {
  return (
    <div className="centered-message">
      <Spinner animation="border" role="status">
        <span className="visually-hidden">{label}</span>
      </Spinner>
    </div>
  );
}
