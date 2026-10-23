import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { useEffect, useState, type ReactNode } from "react";
import { Spinner } from "react-bootstrap";
import { auth } from "../firebase";
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
      <div className="centered-message">
        <h2>Couldn't connect</h2>
        <p>{error.message}</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>
          Try again
        </button>
      </div>
    );
  }
  if (!uid) {
    return (
      <div className="centered-message">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Connecting…</span>
        </Spinner>
      </div>
    );
  }
  return <AuthContext value={uid}>{children}</AuthContext>;
}
