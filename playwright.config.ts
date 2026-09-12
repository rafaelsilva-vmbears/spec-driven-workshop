import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/playwright',
  use: {
    baseURL: process.env.API_BASE_URL || 'http://localhost:3000',
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
    },
  },
  webServer: {
    command: 'pnpm start',
    url: 'http://localhost:3000/api/docs',
    reuseExistingServer: true,
    timeout: 30000,
  },
})
