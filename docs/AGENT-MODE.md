## Project Agent Mode (Project Agent - Full Action, Token-Efficient)

This repository includes a dedicated project agent mode to allow an autonomous, proactive assistant to perform routine maintenance, CI repairs, E2E validation, and repository management while optimizing token usage and minimizing rate-limiting errors when interacting with GitHub Copilot/Chat.

Purpose
-------

- Provide a high-confidence, action-oriented agent mode for `Holiday-Card-Order-Fourm`.
- Protect token budgets by defaulting to concise responses and action-only outputs.

Key Properties
--------------

- Full-action: The agent may run tests, update files, open PRs, and push changes.
- Token-efficient: Prefer short, explicit outputs; compress logs; attach artifacts; use diffs instead of entire file contents when possible.
- Safe defaults: Run tests and lint locally before opening PRs; log reasoning and check results in an artifact rather than long messages.

PowerShell & Windows
--------------------

- This project prefers PowerShell for development on Windows. Use `Push-Location`/`Set-Location` instead of `cd /d` to avoid the `Cannot find path 'D:\d'` issue.
- A setup helper `npm run setup-powershell` (which runs `./scripts/setup-powershell-env.ps1`) will set the execution policy for the current user to `RemoteSigned` so scripts like `npm` and `npx` work in a standard PowerShell environment.

E2E Test Runner
---------------

- Use `npm run e2e:run-prod` which invokes a Node-based E2E runner `scripts/e2e-run-prod.js` to avoid `wmic.exe` and PowerShell-specific artifacts.
- CI uses `playwright-e2e.yml` on the repository; the run produces an HTML report and uploads it as an artifact called `playwright-report`.

Token-saving Etiquette
----------------------

- For every output, prefer a one-line summary, then a short bullet list of steps taken and artifacts created.
- When including logs or large outputs, compress or store them as artifacts rather than plaintext in the chat.
- Avoid redundant re-reads or re-writing of unchanged files.

How to use the Agent Mode
-------------------------

1. Ensure you are on `chore/prettier-overrides` or another branch you own (do not run on `master`).
2. Run `npm ci` and `npm run e2e:run-prod` locally to test everything.
3. Use `gh` CLI to create a PR or use the web UI. The agent may automatically push or refresh the PR when needed.

If you want to change an agent behavior, edit `assistant.project-agent.chatmode.md` and `assistant.project-agent.instructions.md`.
