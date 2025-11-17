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

Agenic mode: automated agent enabled on 2025-11-17T14:42:30.588Z
