import { QrCode, Share2, UserPlus } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router";
import { useUid } from "../auth/AuthContext";
import { InviteDialog } from "../components/InviteDialog";
import { NameDialog } from "../components/NameDialog";
import { PickingStage } from "../components/PickingStage";
import { PlayerStrip } from "../components/PlayerStrip";
import { ResultsStage } from "../components/ResultsStage";
import { Stepper } from "../components/Stepper";
import { CenteredSpinner } from "../components/ui/Spinner";
import { useToast } from "../components/ui/toastContext";
import { VotingStage } from "../components/VotingStage";
import { useLobby } from "../hooks/useLobby";
import { shareInvite } from "../lib/invite";
import { isValidLobbyCode, normalizeLobbyCode } from "../lib/lobbyCode";
import { loadSavedName, playersOf, saveName } from "../lib/players";
import { forgetLobby, rememberLobby } from "../lib/recentLobbies";
import { joinLobby, renameMember } from "../services/lobby";

export function LobbyPage() {
  const raw = useParams().code ?? "";
  const code = normalizeLobbyCode(raw);
  if (!isValidLobbyCode(code)) return <LobbyNotFound code={raw} />;
  if (code !== raw) return <Navigate to={`/lobby/${code}`} replace />;
  return <LobbyView key={code} code={code} />;
}

function LobbyView({ code }: { code: string }) {
  const uid = useUid();
  const toast = useToast();
  const navigate = useNavigate();
  const state = useLobby(code);
  const [savedName, setSavedName] = useState(loadSavedName);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const joinRequested = useRef(false);

  const lobby = state.status === "ready" ? state.lobby : null;
  const me = lobby?.members?.[uid];
  const isMember = me !== undefined && me !== null;
  // Anyone opening the link joins automatically, unless the vote is already over.
  const needsJoin = lobby !== null && !isMember && lobby.stage !== "DONE";

  const join = useCallback(
    (name: string) => {
      if (joinRequested.current) return;
      joinRequested.current = true;
      setJoinError(null);
      joinLobby(code, uid, name).catch((err: Error) => {
        joinRequested.current = false;
        setJoinError(err.message);
      });
    },
    [code, uid],
  );

  // People who've played before already have a name, so they go straight in.
  useEffect(() => {
    if (needsJoin && savedName) join(savedName);
  }, [needsJoin, savedName, join]);

  useEffect(() => {
    if (state.status === "ready") rememberLobby(code);
    if (state.status === "missing") forgetLobby(code);
  }, [state.status, code]);

  if (state.status === "loading") return <CenteredSpinner label="Loading lobby…" />;
  if (state.status === "missing") return <LobbyNotFound code={code} />;
  if (state.status === "error") {
    return (
      <div className="centered">
        <h2>Couldn't load this lobby</h2>
        <p className="muted">{state.error.message}</p>
        <Link to="/" className="btn btn-primary">
          Back to home
        </Link>
      </div>
    );
  }

  const current = state.lobby;
  const players = playersOf(current);
  const isHost = current.hostId === uid;
  const alone = players.length <= 1 && current.stage === "PICKING";

  const rename = (name: string) => {
    saveName(name);
    setSavedName(name);
    setRenameOpen(false);
    const joinedAt = typeof me === "number" ? me : (me?.joinedAt ?? 0);
    renameMember(code, uid, name, joinedAt).then(
      () => toast("Name updated", "success"),
      () => toast("Couldn't change your name. Try again.", "error"),
    );
  };

  const share = async () => {
    const result = await shareInvite(code);
    if (result === "copied") toast("Invite link copied!", "success");
    if (result === "failed") setInviteOpen(true);
  };

  return (
    <div className="lobby">
      <div className="lobby-top">
        <button
          type="button"
          className="code-pill"
          onClick={() => setInviteOpen(true)}
          aria-label={`Lobby code ${code}. Show invite options`}
          style={{ cursor: "pointer" }}
        >
          <span className="label">Code</span>
          <span className="code">{code}</span>
          <span className="icon-btn" aria-hidden="true" style={{ width: 34, height: 34 }}>
            <QrCode size={16} />
          </span>
        </button>
        <button type="button" className="btn" onClick={share}>
          <Share2 size={18} /> Invite
        </button>
      </div>

      <Stepper stage={current.stage} />
      <PlayerStrip lobby={current} uid={uid} onRename={() => setRenameOpen(true)} />

      {alone && isHost && (
        <div className="banner">
          <p>
            <UserPlus size={18} style={{ verticalAlign: "-3px" }} aria-hidden="true" /> It's just you so far. Invite
            your friends to join!
          </p>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setInviteOpen(true)}>
            Show invite
          </button>
        </div>
      )}

      {joinError && (
        <div className="alert" role="alert" style={{ marginBottom: 16 }}>
          Couldn't join this lobby: {joinError}{" "}
          <button type="button" className="btn btn-sm" onClick={() => savedName && join(savedName)}>
            Try again
          </button>
        </div>
      )}

      {current.stage === "PICKING" && <PickingStage code={code} lobby={current} uid={uid} canAct={isMember} />}
      {current.stage === "VOTING" && <VotingStage code={code} lobby={current} uid={uid} canAct={isMember} />}
      {current.stage === "DONE" && <ResultsStage code={code} lobby={current} uid={uid} />}

      <InviteDialog code={code} open={inviteOpen} onClose={() => setInviteOpen(false)} />

      <NameDialog
        open={needsJoin && !savedName}
        initialName=""
        title="Join the movie night"
        submitLabel="Join"
        onSubmit={(name) => {
          saveName(name);
          setSavedName(name);
        }}
        // Esc, the close button or Android back all mean "not now". Replace the
        // history entry so the next back press leaves instead of returning here.
        onClose={() => navigate("/", { replace: true })}
      >
        <p className="muted small" style={{ margin: 0 }}>
          Not now? <Link to="/">Go back home</Link>
        </p>
      </NameDialog>

      {renameOpen && (
        <NameDialog
          open
          initialName={savedName}
          title="Change your name"
          submitLabel="Save"
          onSubmit={rename}
          onClose={() => setRenameOpen(false)}
        />
      )}
    </div>
  );
}

function LobbyNotFound({ code }: { code: string }) {
  return (
    <div className="centered">
      <h2>Lobby not found</h2>
      <p className="muted">
        There's no movie night with the code <strong>{code}</strong>. Double-check it with whoever invited you.
      </p>
      <Link to="/" className="btn btn-primary">
        Back to home
      </Link>
    </div>
  );
}
