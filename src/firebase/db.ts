// Kept separate from auth so the database SDK only loads with the lobby screens.
import { connectDatabaseEmulator, getDatabase } from "firebase/database";
import { app, useEmulators } from "./app";

export const db = getDatabase(app);

if (useEmulators) connectDatabaseEmulator(db, "127.0.0.1", 9300);
