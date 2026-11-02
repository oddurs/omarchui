import { execFileSync } from "node:child_process";
import { defineConfig, devices } from "@playwright/test";

// A free port next to the dev port, so e2e can run while `pnpm dev` is up.
const port = Number(process.env.E2E_PORT ?? execFileSync("./scripts/port").toString()) + 1;

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL: `http://127.0.0.1:${port}`, trace: "retain-on-failure" },
  projects: [
    { name: "light", use: { ...devices["Desktop Chrome"], colorScheme: "light" } },
    { name: "dark", use: { ...devices["Desktop Chrome"], colorScheme: "dark" } },
  ],
  webServer: {
    // e2e runs against the production build; `scripts/task check` builds first.
    command: `test -f .next/BUILD_ID || pnpm exec next build; pnpm exec next start -p ${port}`,
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
