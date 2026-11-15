import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  timeout: 60000,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:5174',
    channel: process.env.PLAYWRIGHT_BROWSER_CHANNEL || 'msedge',
    viewport: { width: 1440, height: 1100 },
    trace: 'retain-on-failure',
  },
  webServer: [
    {
      command: 'npm.cmd --prefix backend run start:prod',
      url: 'http://127.0.0.1:3002',
      env: { PORT: '3002', CORS_ORIGIN: 'http://127.0.0.1:5174' },
      reuseExistingServer: false,
      timeout: 30000,
    },
    {
      command: 'npm.cmd run dev -- --host 127.0.0.1 --port 5174 --strictPort',
      url: 'http://127.0.0.1:5174',
      env: { VITE_API_URL: 'http://127.0.0.1:3002' },
      reuseExistingServer: false,
      timeout: 30000,
    },
  ],
});
