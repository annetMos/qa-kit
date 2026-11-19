import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

/**
 * Если BASE_URL не задан (нет .env) — тесты идут против встроенного demo-app,
 * который Playwright поднимет сам. Так `npm test` работает сразу после клонирования.
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
      // PW_CHANNEL=chrome — запуск в установленном Google Chrome вместо браузера Playwright
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
