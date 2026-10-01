import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.{ts,js}"],
    environment: "node",
    // The coverage tests read whole word lists; a slow runner needs longer than five seconds for the biggest.
    testTimeout: 30_000,
  },
});
