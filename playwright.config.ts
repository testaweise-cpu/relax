import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PORT ?? 3100);
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
    timezoneId: "Europe/Berlin",
    locale: "de-DE",
    // Optional vorinstalliertes Chromium nutzen (z. B. in CI-Containern).
    launchOptions: process.env.PW_CHROMIUM_PATH
      ? { executablePath: process.env.PW_CHROMIUM_PATH }
      : undefined,
  },
  projects: [
    // iPhone-Safari- und Android-Chrome-Größen; gerendert mit Chromium,
    // WebKit kann zusätzlich mit PW_WEBKIT=1 aktiviert werden.
    {
      name: "iphone",
      use: {
        ...devices["iPhone 15"],
        defaultBrowserType: "chromium",
      },
    },
    { name: "android", use: { ...devices["Pixel 7"] } },
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
    },
    ...(process.env.PW_WEBKIT
      ? [{ name: "iphone-webkit", use: { ...devices["iPhone 15"] } }]
      : []),
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: `pnpm start -p ${PORT}`,
        url: `${baseURL}/api/health`,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
