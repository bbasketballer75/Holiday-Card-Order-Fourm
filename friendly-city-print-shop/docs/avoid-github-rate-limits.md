# Avoiding GitHub Rate Limiting (Developer Notes)

If you're encountering GitHub API rate limiting during development or CI, here are steps to mitigate:

1. Authenticate requests
   - Use `gh auth login` or set `GITHUB_TOKEN` / personal access tokens (PAT) for authenticated requests. Authenticated requests have a higher rate limit.
   - In CI, prefer the built-in `GITHUB_TOKEN` or configure a PAT in the repository secrets with minimal scopes.

2. Use the GitHub CLI (`gh`) locally instead of making raw API requests when possible.

3. Reduce the number of API calls
   - Batch actions or fetch only required data (use GraphQL and specify fields).
   - Cache responses where feasible and use `ETag`/`If-None-Match` headers to avoid re-fetching unchanged resources.

4. Use terse, local operations instead of API calls
   - Use git commands and local filesystem operations instead of programmatic API calls for simple tasks.

5. Configure CI and tooling to avoid excessive polling
   - Avoid frequent loops that poll the GitHub API; add delays/backoffs.

6. If necessary, use a PAT with minimal scopes for higher quota in local dev/developer tools (cleanup tokens when not needed).

7. In local scripts, use retries with exponential backoff to avoid hammering the API and triggering rate-limits.

These steps will help maintain a healthy usage of GitHub APIs and avoid frequent rate-limiting errors while developing and CI running.

## Copilot-specific rate limits and how to work around them

If you're seeing Copilot-specific errors like "Sorry, you have exceeded your Copilot token usage", try these steps:

- Sign out / sign in: Reauthenticate via the VS Code GitHub sign-in flow to refresh tokens.
- Minimize inline suggestions: Turn off inline suggestions or lower Copilot's usage in the VS Code workspace to reduce calls. See `.vscode/settings.json` in this repo.
- Reduce repetition: Avoid generating many suggestions (Ctrl+Enter) in rapid succession and prefer targeted prompts.
- Use a paid Copilot plan or per-user PAT: Copilot is tied to licensing; consider upgrading or using per-user tokens if you prefer more consistent throughput.
- Fallback to local tools: For large or repeated code-generation workloads, consider local open-source models (LLMs) or use traditional code templates to avoid API calls.
- Contact GitHub Support: If you believe your token usage is unexpectedly high, open a support ticket with GitHub to check if the issue is account-related.

Following these steps will reduce the chance of hitting Copilot rate-limits while you're developing.
