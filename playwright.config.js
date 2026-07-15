// CommonJS a propósito, igual que jest.config.js/babel.config.js: son
// archivos de configuración de herramienta que Node ejecuta directamente,
// antes de que exista cualquier paso de transpilación.
const { defineConfig, devices } = require('@playwright/test');

const PORT = process.env.E2E_PORT || 4173;

module.exports = defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  fullyParallel: false,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev',
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    env: { PORT: String(PORT) },
  },
});
