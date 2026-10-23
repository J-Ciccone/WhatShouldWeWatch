import { defineConfig } from "vitest/config";

// Security-rules and client-write tests. They need the Auth and Database
// emulators, so run them with `npm run test:rules` rather than plain `vitest`.
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/rules/**/*.test.ts"],
    fileParallelism: false,
    env: { VITE_USE_EMULATORS: "true" },
  },
});
