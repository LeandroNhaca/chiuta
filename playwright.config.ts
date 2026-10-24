import { defineConfig, devices } from '@playwright/test';

// Em ambientes com o Chromium já instalado noutra revisão, aponte PW_CHROMIUM para o executável.
const executablePath = process.env.PW_CHROMIUM || undefined;
const porta = 4329;

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: [['list']],
  use: {
    baseURL: `http://127.0.0.1:${porta}`,
    trace: 'retain-on-failure',
    locale: 'pt-PT',
    timezoneId: 'Africa/Maputo',
    launchOptions: { executablePath },
  },
  projects: [
    { name: 'telemovel-pequeno', use: { ...devices['Galaxy S9+'], viewport: { width: 360, height: 740 } } },
    { name: 'telemovel', use: { ...devices['Pixel 7'] } },
    {
      name: 'tablet',
      use: { ...devices['Desktop Chrome'], viewport: { width: 820, height: 1180 }, hasTouch: true },
    },
    { name: 'portatil', use: { ...devices['Desktop Chrome'], viewport: { width: 1366, height: 768 } } },
    { name: 'monitor', use: { ...devices['Desktop Chrome'], viewport: { width: 1920, height: 1080 } } },
  ],
  webServer: {
    command: `npm run preview -- --host 127.0.0.1 --port ${porta}`,
    url: `http://127.0.0.1:${porta}/`,
    reuseExistingServer: !process.env.CI,
  },
});
