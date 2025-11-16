const webServerCmd = process.env.WEB_SERVER_CMD || 'npm run dev';
const webServerConfig =
  process.env.PW_NO_WEB_SERVER === 'true'
    ? undefined
    : {
        command: webServerCmd,
        port: 3000,
        reuseExistingServer: true,
        timeout: 120000,
      };

module.exports = {
  testDir: 'tests/e2e',
  timeout: 30_000,
  expect: { timeout: 5000 },
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    headless: true,
  },
  webServer: webServerConfig,
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
};
