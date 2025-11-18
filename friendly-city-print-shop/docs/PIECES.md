# Pieces for Developers Integration

Pieces for Developers helps you capture and reuse code snippets, notes, and other developer artifacts. This project recommends using Pieces to store and retrieve PR-related snippets and developer context.

## Why use Pieces

- Centralized snippets and notes for code reviews and onboarding.
- Quickly reuse code fragments across different parts of the project.
- Integrates with GitHub to attach snippets to PRs and issues.

## Install Pieces to this repository

1. Go to the Pieces application page: <https://github.com/apps/pieces> (or visit the Pieces developer page).
2. Click **Install** and choose this repository (`Holiday-Card-Order-Fourm`) when prompted.
3. Configure the permissions: at minimum, grant read & write access to issues and pull requests.

## Repository configuration

1. Add a repository secret named `PIECES_API_TOKEN` with your Pieces API token (or integration token). Keep this secret scoped to the `friendly-city-print-shop` repository environment.
2. Optionally add `PIECES_API_URL` secret if your Pieces server is hosted at a custom domain (defaults to <https://api.pieces.app/v1/snippets>).
2. Optionally enable any additional repository options from the Pieces configuration page.

## Example usage

- We provide a simple GitHub Action that runs on `pull_request` and demonstrates how you can send a PR summary to Pieces.
  
**Workflow:** `.github/workflows/pieces-integration.yml`

### Local testing

You can test the sync script locally by setting environment variables and running:

```bash
PIECES_API_TOKEN=your_token \
GITHUB_EVENT_PATH=./test/pull_request_event.json \
bash ./scripts/pieces-sync.sh
```

Create a `test/pull_request_event.json` sample with a minimal pull_request payload for testing.

Use the `gh` CLI to set secrets from your machine:

```bash
gh secret set PIECES_API_TOKEN --body "<YOUR_TOKEN>" --repo owner/repo
gh secret set PIECES_API_URL --body "https://api.pieces.app/v1/snippets" --repo owner/repo
```

## Security

- Never add API tokens to the repo; always use GitHub repository secrets.
- Rotate your Pieces token periodically.

## Next steps

- If you want me to enable this integration for the repo, I can try to install the GitHub App (requires admin/owner privileges) and create a PR with the example workflow. Ask me to proceed and I’ll do it now.
