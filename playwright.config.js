import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/browser",
  workers: 1,
  use: {
    channel: process.env.TEST_BROWSER || "chrome",
    baseURL: "http://127.0.0.1:5182",
    viewport: { width: 1440, height: 940 },
  },
  webServer: {
    command:
      "node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5182 --strictPort",
    url: "http://127.0.0.1:5182",
    reuseExistingServer: true,
  },
});
