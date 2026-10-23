import { connectAuthEmulator, getAuth } from "firebase/auth";
import { app, useEmulators } from "./app";

export const auth = getAuth(app);

if (useEmulators) connectAuthEmulator(auth, "http://127.0.0.1:9399", { disableWarnings: true });
