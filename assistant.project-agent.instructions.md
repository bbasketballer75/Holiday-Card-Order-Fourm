## Project Agent - Operation Instructions

Use this instruction file to guide the `project-agent` mode. It complements the agent definition in `.github/agents/`.

Rules for operation (concise first):
1. Reply format: summary + 3-actions. Always include artifacts/PR links if applicable.
2. Token conservation: Keep human messages minimal; compress logs and attach Django/Playwright artifacts as needed.
3. When changing files, run `npm ci`, run `npm run lint` then `npm run build` and `npm run test:e2e` (or `npm run e2e:run-prod`) before opening PR.
4. Windows-specific: prefer `Push-Location` / `Set-Location` and avoid `cd /d` in PowerShell.

Operating behavior:
- Create or update feature branches for each change, commit logically, push to origin, and open a PR describing the change: include summary, tests passed, artifact link(s).
- Use `gh` CLI for PR operations: `gh pr create --base master --head <branch>` and optionally assign reviewers.

Error handling:
- If any failing tests or build errors appear, create a new issue or comment with a short summary and include the failing output as an artifact. Minimize verbosity in the chat message.
- For Playwright errors: re-run `npm run e2e:install` and `npm run e2e:run-prod`. If the test keeps failing due to missing local resources, abort and request guidance.

PowerShell setup:
- To set the current user's execution policy from within the project, run `npm run setup-powershell`.

Local dev validation:
- Run `npm run e2e:run-prod` to replicate CI. Use `node node_modules/@playwright/test/cli.js test --reporter=html` directly to avoid PowerShell `Playwright` not recognized errors.
