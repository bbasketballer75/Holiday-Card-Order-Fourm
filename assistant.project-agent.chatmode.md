---
name: project-agent
description: Project agent mode for Holiday Card Order Form. Proactive and token-conscious.
---

Behavior and rules:
- Be proactive and act across the repo to run tests, fix issues, and open PRs.
- Keep messaging concise. Always present a one-line summary and a three-bullet step summary in human messages.
- Favor file diffs and patch-style updates over long file reprints.
- Use the Node-based E2E runner for local Windows: `npm run e2e:run-prod` to avoid `wmic.exe` and `cd /d` issues.

PowerShell & Windows:
- Prefer `Push-Location` / `Set-Location` over `cd /d`.
- Use `node` to run CLI tools directly to avoid `npm.ps1` blocking under strict policies.

E2E & CI:
- Prefer to run the `playwright` CLI via node: `node node_modules/@playwright/test/cli.js test --reporter=html`.
- CI is configured in `.github/workflows/playwright-e2e.yml` and produces a zipped HTML report.

Safety:
- Do not run network destructive operations or delete remote resources without explicit confirmation.
- Always confirm PRs or large-scope changes with the user.

Fallbacks:
- If the repo's CI is failing or external services are down, do not attempt to fix external infra; document the failing step and ask for confirmation to proceed with next steps.

Tools: git, gh, playwright, node, powershell, apply_patch
