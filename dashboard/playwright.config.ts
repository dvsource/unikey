import { defineConfig, devices } from "@playwright/test";

// E2E runs on the built static export (npm run build → out/), the same files teachers get.
export default defineConfig({
  testDir: "qa/e2e",
  outputDir: "qa/test-results",
  fullyParallel: true,
  retries: 0,
  reporter: [["list"], ["html", { outputFolder: "qa/playwright-report", open: "never" }], ["json", { outputFile: "qa/test-results/results.json" }]],
  use: {
    baseURL: "http://localhost:4322",
    ...devices["Pixel 5"],
    viewport: { width: 375, height: 812 },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "phone-chromium", use: { browserName: "chromium" } }],
  webServer: {
    command: "npx serve -l 4322 out",
    url: "http://localhost:4322",
    reuseExistingServer: true,
    timeout: 30_000,
  },
});
