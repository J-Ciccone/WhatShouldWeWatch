import { createContext, useContext } from "react";

export const AuthContext = createContext<string | null>(null);

/** The signed-in (anonymous) user's id. Only usable inside <AuthProvider>. */
export function useUid(): string {
  const uid = useContext(AuthContext);
  if (!uid) throw new Error("useUid must be used inside <AuthProvider>");
  return uid;
}
