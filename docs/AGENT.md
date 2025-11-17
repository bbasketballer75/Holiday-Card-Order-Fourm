## Agent: Enabling Agenic Mode

This repository includes a minimal agent-runner for opt-in automation (Agenic mode). The runner is safe by default and requires explicit enablement.

Quickstart:

1. Add an `.agentconfig.yml` to the repository root with `agent.mode: agenic`. Use the sample below.
2. Add a GitHub secret: `AGENT_GITHUB_TOKEN` with a token that has repo permissions to create branches and PRs (or configure a scoped GitHub App).
3. Only maintainers should set `AGENT_MODE=agenic` via repository secrets or `.agentconfig.yml`.
4. Run in dry-run mode to validate behavior:

```bash
cd friendly-city-print-shop
npm ci
npm run agent:run # dry-run by default - no remote actions performed
```

5. When ready, run with `--apply` to actually push and create PRs:

```bash
npm run agent:run -- --apply --base master --title "AUTO: your title" --body "Optional PR body"
```

Sample `.agentconfig.yml`:

```yaml
agent:
  mode: agenic
  allowAutoMerge: true
  allowProductionDeploy: false
  allowedAutoMergeBranches:
    - staging
  allowSecretRotation: false
  allowLargePRs: false
  allowedPRSize: 200
  requireCodeOwners: true
  requireApprovalsBeforeProduction: true
```

Security notes:

- Do not use admin-level tokens unless necessary; prefer scoped GitHub Apps or repo-scoped tokens.
- Do not commit or print secret values in PRs or logs; the runner avoids that.

### Chat-provided secrets

- If an operator provides tokens or API keys in chat sessions that should be persisted for the agent, set the `AGENT_CHAT_SECRETS` environment variable to a semicolon-separated list of key-value pairs: `KEY=VALUE;OTHER_KEY=VALUE2`.
- The `agent-runner` detects `AGENT_CHAT_SECRETS` automatically and adds entries to `friendly-city-print-shop/.env.local`. If `--gh` or `--repo` are passed it will also set repo-level secrets via `gh secret set`.
- The `add-secret-to-env.js` helper supports both CLI invocation and `AGENT_CHAT_SECRETS` parsing and can be used directly to persist secrets.
 - The `docs-auto-update` workflow prefers `REPO_WRITE_TOKEN` (a scoped personal access token) when set in the repository secrets to handle cases where `GITHUB_TOKEN` lacks push permissions.
Agenic mode: automated agent enabled on 2025-11-17T14:42:30.588Z
