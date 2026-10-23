import { initializeApp } from "firebase/app";

const env = import.meta.env;

export const app = initializeApp({
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: env.VITE_FIREBASE_DATABASE_URL,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  appId: env.VITE_FIREBASE_APP_ID,
});

/** Set by `npm run dev:emulators` and the rules tests. Ports match firebase.json. */
export const useEmulators = env.VITE_USE_EMULATORS === "true";
