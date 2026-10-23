import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { useEffect, useState, type ReactNode } from "react";
import { CenteredSpinner } from "../components/ui/Spinner";
import { auth } from "../firebase/auth";
import { AuthContext } from "./AuthContext";

/**
 * Signs every visitor in anonymously so the database rules can tell players
 * apart. The id persists in the browser, so a refresh keeps your picks and votes.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [uid, setUid] = useState<string | null>(auth.currentUser?.uid ?? null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(
    () =>
      onAuthStateChanged(auth, (user) => {
        if (user) {
          setUid(user.uid);
          setError(null);
        } else {
          setUid(null);
          signInAnonymously(auth).catch(setError);
        }
      }),
    [],
  );

  if (error) {
    return (
      <div className="centered" style={{ padding: 24 }}>
        <h2>Couldn't connect</h2>
        <p className="muted">{error.message}</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>
          Try again
        </button>
      </div>
    );
  }
  if (!uid) return <CenteredSpinner label="Connecting…" />;
  return <AuthContext value={uid}>{children}</AuthContext>;
}
