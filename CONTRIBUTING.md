# Contributing Guidelines

Thanks for helping maintain this project. A quick note about usage of GitHub Copilot / AI tools:

- This repository provides workspace-level settings to purposely reduce Copilot / inline suggestion usage (`.vscode/settings.json`). We do this to avoid hitting per-user or project Copilot API rate limits and to make sure CI runs and developer machines remain stable.
- If you need to use Copilot or Copilot Chat temporarily for a focused session, re-enable it in your *user* settings or your editor session, and avoid leaving it on for long-running or automated tasks.
- For guidance and best practices, see `friendly-city-print-shop/docs/avoid-github-rate-limits.md`.

General contribution workflow:

1. Fork/branch from `master`.
2. Run `npm ci` and `npm run lint` locally before pushing commits.
3. Create a PR and add reviewers.
