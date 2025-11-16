Quickstart
----------

To run Playwright E2E quickly against the dev server:

~~~bash
cd friendly-city-print-shop
npm ci
npm run test:e2e
~~~
To run a full CI-like e2e locally (seed -> production build -> start -> test -> cleanup):

~~~bash
cd friendly-city-print-shop
npm ci
npm run e2e:run-prod
~~~

Project Agent Additional Instructions
-------------------------------------

- Use the `project-agent` mode for active, automated repository maintenance and CI/qa operations.
- The agent should prioritize token saving: always respond concisely with one-line summaries and only elaborate on request.
- Use `npm run e2e:run-prod` or `node node_modules/@playwright/test/cli.js test --reporter=html` for running Playwright locally (avoids `Playwright` not recognized in PowerShell).
- To set PowerShell execution policy for the current user (to avoid `npm.ps1` load errors), run `npm run setup-powershell`.

