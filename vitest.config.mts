import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    // Zeitlogik muss unabhängig von der Server-Zeitzone stimmen:
    // Tests laufen bewusst in UTC, gerechnet wird in Europe/Berlin.
    env: { TZ: "UTC" },
  },
});
