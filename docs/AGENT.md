Project AI Assistant/Agent Guidance
==================================

This file documents suggested instructions and environment guidance for a project-scoped AI assistant (an "agent") that can help automate or manage development, testing, and CI tasks for the repository.

Purpose
-------

The agent should:

- Know how to run this project locally, build it, and run Playwright tests.
- Be able to seed and cleanup a Supabase test DB for E2E.
- Avoid leaking secrets and instruct maintainers to use GitHub Secrets/Environments.
- Provide modular, repeatable instructions in PRs and workflows.

Suggested Contents
------------------

- Project introduces: Next.js 14, React 18, Tailwind, Supabase, Playwright for E2E.
- The agent should prefer to run `npm run e2e:run-prod` for CI-like tests locally and `npm run test:e2e` to quickly run Playwright tests.
- If Supabase keys are missing, the project should still render the UI (local mocks or seeded local entries) to keep tests fast and reliable.
- The agent must never write or source secrets directly into the repo; always read from `process.env` or GitHub Secrets.

Repository layout references
---------------------------

- `friendly-city-print-shop/` — the Next.js app package (entrypoint for dev/build/test).
- `friendly-city-print-shop/tests/e2e` — Playwright test suite.
- `friendly-city-print-shop/scripts` — helper scripts include `e2e-setup.js` and `e2e-cleanup.js`.
- `docs/CI-E2E.md` — CI secrets and setup instructions (where the agent should redirect maintainers for additional ops).

Workflow & Operation
--------------------

- When a contributor or the agent needs to run a full production-like E2E, it should:
  1. Confirm secrets exist in `process.env` or GitHub Secrets.
  2. Ensure `npm ci` and `npm run build` was performed.
  3. Run `npm run e2e:seed`, then `npm run start` and wait for the server, then `npx playwright test`.
  4. Clean up using `npm run e2e:cleanup`.

Safety & Security
-----------------

- Prefer a dedicated Supabase test project for E2E and keep the production DB safe and isolated.
- Use GitHub Environment secrets for branch restrictions (Preview, E2E, Production) and rotate keys periodically.
- The agent should print human-readable warnings when a secret is missing and suggest the exact GitHub secrets names to be created.

Custom Local Agent File
-----------------------

You can optionally add an `assistant.instructions.md` to the repo root with the same guidance. This will help future agents (and developers) follow a consistent set of steps for E2E and CI.

Revision & Onboarding
---------------------

Add to PR templates or onboarding checklists instructions to review `docs/CI-E2E.md` and `docs/AGENT.md` when making changes to E2E or CI.

Consolidation note
------------------

We consolidated environment secrets to the two primary environments `Preview – holiday-card-order-fourm` and `Production – holiday-card-order-fourm` on 2025-11-16 and removed duplicate environments. The agent should now set & validate secrets in those base environments and avoid creating unnecessary duplicates.
