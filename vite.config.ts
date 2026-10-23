/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command, mode }) => {
  // A production build without the TMDB token deploys a site where search
  // silently doesn't work, so refuse to build one.
  if (command === "build" && mode === "production" && !loadEnv(mode, process.cwd(), "VITE_").VITE_TMDB_READ_TOKEN) {
    throw new Error("VITE_TMDB_READ_TOKEN is not set. Add it to .env.local before building (see README).");
  }

  return {
    plugins: [react()],
    test: {
      environment: "jsdom",
      setupFiles: ["./src/test/setup.ts"],
      include: ["src/**/*.test.{ts,tsx}"],
    },
  };
});
