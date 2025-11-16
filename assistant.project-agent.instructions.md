## Project Agent - Operation Instructions

Use this instruction file to guide the `project-agent` mode. It complements the agent definition in `.github/agents/`.

### Directive
- Maximize productivity while minimizing token consumption through compressed communication and direct action.

### Behavior protocols
- Execute repo operations proactively: run tests, fix issues, open PRs, and archive large outputs automatically instead of pasting logs.
- Favor patch-style diffs and avoid full-file reprints.
- Always run at least `npm run build:prod`, `npm run test:ci -- --coverage`, and `npm run e2e:run-prod` before opening a PR.
- Prefer `Push-Location` / `Set-Location` over `cd /d` in PowerShell and invoke CLIs via `node` to dodge `npm.ps1` friction.
- GitHub Pull Request extension is currently unreliable; rely on the `gh` CLI for PR operations until it stabilizes.

### Token optimization
- Always reply with a single-line summary followed by three bullet actions.
- Keep replies concise; use artifact references rather than pasting large logs.
- Skip extra explanation unless the user explicitly asks for details.

### Testing & deployment commands
- Local Windows-friendly: `node scripts/e2e-run-prod.js --browser=all`.
- CI-grade verification: `npm run test:ci -- --coverage` and `npm run build:prod`.
- Database versioning (if needed): `npm run db:migrate:create -- ${migration_name}` and `npm run db:seed:production`.

### WSL & database helpers
- PostgreSQL: `sudo service postgresql start` and `psql -h localhost -U postgres -d holiday_cards`.
- MySQL alternative: `sudo service mysql start` prior to migrations or seeds.
- From PowerShell, you can invoke WSL with `wsl sudo service postgresql start` and `wsl -- node scripts/e2e-run-prod.js`.
- When Postgres is absent, run `sudo apt update && sudo apt install postgresql postgresql-contrib` followed by `sudo -u postgres createdb holiday_cards`.
- MCP servers/tooling: activate any helpful MCP servers you have available before starting work so the agent has maximum support for memory and automation flows.

### Workflow automation guidance
- Follow a Test → Fix → Deploy cycle and name feature branches `feature/YYYYMMDD-auto` when creating them automatically.
- Run `scripts/e2e-run-prod.js` before creating a PR and store HTML reports under `playwright-report` for referencing artifacts.
- Open PRs automatically after successful test execution but confirm deployment steps with the user before touching staging/production.
- Deploy to staging once checks pass; production deployments require manual sign-off and should trigger a rollback on E2E failure.

### Security boundaries
- Do not modify remote secrets or production systems without explicit human approval.
- Avoid touching remote secrets or remote systems without prior approval; escalate if unsure.

### Reply template
- Summary: [one-line]
- Steps: [3 bullet actions taken]
- Artifacts: [report link or file path]
