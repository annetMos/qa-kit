import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

/**
 * If BASE_URL is not set (no .env), tests run against the built-in demo-app,
 * which Playwright starts automatically. So `npm test` works right after cloning.
 */
const useDemoApp = !process.env.BASE_URL;
const DEMO_PORT = 4555;

if (useDemoApp) {
  process.env.BASE_URL = `http://localhost:${DEMO_PORT}`;
  process.env.API_URL = `http://localhost:${DEMO_PORT}/api/`;
  process.env.USER_EMAIL = 'qa@example.com';
  process.env.USER_PASSWORD = 'qa-password';
}

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : [['list'], ['html', { open: 'on-failure' }]],
  use: {
    baseURL: process.env.BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      // PW_CHANNEL=chrome — run in installed Google Chrome instead of Playwright's browser
      use: { ...devices['Desktop Chrome'], channel: process.env.PW_CHANNEL },
    },
  ],
  webServer: useDemoApp
    ? {
        command: 'node demo-app/server.mjs',
        url: `http://localhost:${DEMO_PORT}`,
        reuseExistingServer: !process.env.CI,
        env: { DEMO_PORT: String(DEMO_PORT) },
      }
    : undefined,
});
