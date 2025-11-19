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
 3. Optionally enable any additional repository options from the Pieces configuration page.

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

 Create a `test/pull_request_event.json` sample with a minimal `pull_request` payload for testing.

 Use the `gh` CLI to set secrets from your machine:

 ```bash
 gh secret set PIECES_API_TOKEN --body "<YOUR_TOKEN>" --repo owner/repo
 gh secret set PIECES_API_URL --body "https://api.pieces.app/v1/snippets" --repo owner/repo
 ```

 Or run the provided helper script (requires `gh` CLI and admin permissions):

 ```bash
 export PIECES_API_TOKEN="<YOUR_TOKEN>"
 export PIECES_API_URL="https://api.pieces.app/v1/snippets"
 cd friendly-city-print-shop
 bash ./scripts/add-pieces-secret.sh
 ```

 ## Security

 - Never add API tokens to the repo; always use GitHub repository secrets.
 - Rotate your Pieces token periodically.

 ## Next steps

 - If you want me to enable this integration for the repo, I can try to install the GitHub App (requires admin/owner privileges) and create a PR with the example workflow. Ask me to proceed and I’ll do it now.

 ## VS Code setup

 - Install the Pieces extension (recommended) from the Extensions view — we also recommend GitHub Copilot as a workspace extension. See `.vscode/extensions.json`.
 - To connect VS Code to a local Pieces MCP server, start the Pieces desktop app or the local dev server and use the MCP SSE URL: `http://localhost:39300/model_context_protocol/2024-11-05/sse`.
 - We added a minimal `.vscode/mcp.json` workspace file that points at the local server. If your MCP server runs at a different host/port, update the `url` property accordingly.
 - Start the local MCP SSE mock server included in the repository for quick testing:

 ```bash
 cd friendly-city-print-shop
 npm run mcp:start
 ```

 This starts a simple SSE server that can accept events from your local Pieces client and echo messages for testing. It listens on port 39300 by default and supports an endpoint at `/model_context_protocol/2024-11-05/message` to POST JSON messages to any connected SSE clients.

 - Keep repository secrets (`PIECES_API_TOKEN`) in GitHub and never check tokens into source control. For local testing you can export `PIECES_API_TOKEN` in your shell as shown above.

 ## Testing the Pieces MCP gateway locally

 You can run a local gateway that connects to the MCP SSE endpoint (the mock server above) for development and integration testing.

 1. Install the `pieces-cli` Python package into your development Python environment (or install the cloned `cli-agent` repo):

 ```bash
 python -m venv .venv
 source .venv/bin/activate  # or `.venv\Scripts\Activate.ps1` on Windows
 pip install --upgrade pip
 pip install pieces-cli  # or `pip install -e /path/to/cli-agent` when developing
 ```

 1. Start the local mock MCP server:

 ```bash
 npm run mcp:start
 ```

 1. In a separate terminal, run the local gateway wrapper (defaults to the above mock SSE URL):

 ```bash
 python ./scripts/py-run-mcp-gateway.py --upstream-url "http://localhost:39300/model_context_protocol/2024-11-05/sse"
 ```

 This will run the MCPGateway and connect to the mock SSE server. The gateway will keep running until you Ctrl+C it; it will log tool discovery and notifications it receives from the SSE server.

 If you only want to use the gateway as a 'pieces' stdio server for testing local IDE clients, consult the `pieces mcp` commands to setup your integration (e.g. `pieces mcp setup vscode`).
# Pieces for Developers Integration

Pieces for Developers helps you capture and reuse code snippets, notes, and other developer artifacts. This project recommends using Pieces to store and retrieve PR-related snippets and developer context.

## Why use Pieces

- Centralized snippets and notes for code reviews and onboarding.
- Quickly reuse code fragments across different parts of the project.
- Integrates with GitHub to attach snippets to PRs and issues.

## Install Pieces to this repository

1. Go to the Pieces application page: <https://github.com/apps/pieces> (or visit the Pieces developer page).
<<<<<<< HEAD
1. Click **Install** and choose this repository (`Holiday-Card-Order-Fourm`) when prompted.
1. Configure the permissions: at minimum, grant read & write access to issues and pull requests.
=======
2. Click **Install** and choose this repository (`Holiday-Card-Order-Fourm`) when prompted.
3. Configure the permissions: at minimum, grant read & write access to issues and pull requests.
>>>>>>> main

## Repository configuration

1. Add a repository secret named `PIECES_API_TOKEN` with your Pieces API token (or integration token). Keep this secret scoped to the `friendly-city-print-shop` repository environment.
<<<<<<< HEAD
1. Optionally add `PIECES_API_URL` secret if your Pieces server is hosted at a custom domain (defaults to <https://api.pieces.app/v1/snippets>).
1. Optionally enable any additional repository options from the Pieces configuration page.
=======
2. Optionally add `PIECES_API_URL` secret if your Pieces server is hosted at a custom domain (defaults to <https://api.pieces.app/v1/snippets>).
2. Optionally enable any additional repository options from the Pieces configuration page.
>>>>>>> main

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

<<<<<<< HEAD
Or run the provided helper script (requires `gh` CLI and admin permissions):

```bash
export PIECES_API_TOKEN="<YOUR_TOKEN>"
export PIECES_API_URL="https://api.pieces.app/v1/snippets"
cd friendly-city-print-shop
bash ./scripts/add-pieces-secret.sh
```

=======
>>>>>>> main
## Security

- Never add API tokens to the repo; always use GitHub repository secrets.
- Rotate your Pieces token periodically.

## Next steps

- If you want me to enable this integration for the repo, I can try to install the GitHub App (requires admin/owner privileges) and create a PR with the example workflow. Ask me to proceed and I’ll do it now.
<<<<<<< HEAD

## VS Code setup

- Install the Pieces extension (recommended) from the Extensions view — we also recommend GitHub Copilot as a workspace extension. See `.vscode/extensions.json`.
- To connect VS Code to a local Pieces MCP server, start the Pieces desktop app or the local dev server and use the MCP SSE URL: `http://localhost:39300/model_context_protocol/2024-11-05/sse`.
- We added a minimal `.vscode/mcp.json` workspace file that points at the local server. If your MCP server runs at a different host/port, update the `url` property accordingly.
- To connect VS Code to a local Pieces MCP server, start the Pieces desktop app or the local dev server and use the MCP SSE URL: `http://localhost:39300/model_context_protocol/2024-11-05/sse`.
- We added a minimal `.vscode/mcp.json` workspace file that points at the local server. If your MCP server runs at a different host/port, update the `url` property accordingly.
- Start the local MCP SSE mock server included in the repository for quick testing:

```bash
cd friendly-city-print-shop
npm run mcp:start
```

This starts a simple SSE server that can accept events from your local Pieces client and echo messages for testing. It listens on port 39300 by default and supports an endpoint at `/model_context_protocol/2024-11-05/message` to POST JSON messages to any connected SSE clients.

- Keep repository secrets (`PIECES_API_TOKEN`) in GitHub and never check tokens into source control. For local testing you can export `PIECES_API_TOKEN` in your shell as shown above.

## Testing the Pieces MCP gateway locally

You can run a local gateway that connects to the MCP SSE endpoint (the mock server above) for development and integration testing.

1. Install the `pieces-cli` Python package into your development Python environment (or install the cloned `cli-agent` repo):

```bash
python -m venv .venv
source .venv/bin/activate  # or `.venv\Scripts\Activate.ps1` on Windows
pip install --upgrade pip
pip install pieces-cli  # or `pip install -e /path/to/cli-agent` when developing
```

1. Start the local mock MCP server:

```bash
npm run mcp:start
```

1. In a separate terminal, run the local gateway wrapper (defaults to the above mock SSE URL):

```bash
python ./scripts/py-run-mcp-gateway.py --upstream-url "http://localhost:39300/model_context_protocol/2024-11-05/sse"
```

This will run the MCPGateway and connect to the mock SSE server. The gateway will keep running until you Ctrl+C it; it will log tool discovery and notifications it receives from the SSE server.

If you only want to use the gateway as a 'pieces' stdio server for testing local IDE clients, consult the `pieces mcp` commands to setup your integration (e.g. `pieces mcp setup vscode`).

=======
>>>>>>> main
