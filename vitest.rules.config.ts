import { defineConfig } from "vitest/config";

// Security-rules tests. They need the Realtime Database emulator, so run them
// with `npm run test:rules` rather than plain `vitest`.
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/rules/**/*.test.ts"],
    fileParallelism: false,
  },
});
