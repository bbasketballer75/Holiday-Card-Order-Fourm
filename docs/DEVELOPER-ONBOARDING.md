# Developer Onboarding Guide

Welcome to the Holiday Card Order Form project! This guide walks you through setting up your development environment for local development, testing, and deployment.

## Prerequisites

- **Node.js** (v18+) and npm
- **Git** with GitHub CLI (`gh`) for PR management
- **Supabase CLI** (v2.59+) for local dev and migrations
- **PowerShell 7+** (recommended for cross-platform shell consistency)
- **Windows users**: Visual Studio Code Insiders with recommended extensions

## Quick Start (5 minutes)

1. Clone the repository:

```bash
git clone https://github.com/bbasketballer75/Holiday-Card-Order-Fourm.git
cd Holiday-Card-Order-Fourm/friendly-city-print-shop
```

1. Install dependencies:

```bash
npm ci
```

1. Set up Supabase credentials in `.env.local`:

```bash
cp .env.example .env.local
# Edit .env.local and add your NEXT_PUBLIC_SUPABASE_URL, anon key, and service role key
```

1. Install required CLI tools:

```bash
npm run setup-dev
# On Windows, also run:
npm run setup-powershell
```

1. Seed the database and run E2E tests:

```bash
npm run e2e:run-prod
```

## Environment Setup

### Supabase Configuration

1. Create a project at [supabase.com](https://supabase.com)
2. Get your credentials from the Supabase dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL` (Project URL)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Anon public key)
   - `SUPABASE_SERVICE_ROLE_KEY` (Service role key — store securely)
3. Add these to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PORT=3000
```

### Supabase CLI Installation

The Supabase CLI is required for seeding and migrations and must be manually installed:

1. Download the latest Windows binary from [GitHub Releases](https://github.com/supabase/cli/releases)
2. Extract `supabase.exe` to a folder (e.g., `C:\Users\YourName\Downloads`)
3. Add that folder to your `%PATH%` environment variable
4. Verify: `supabase --version` should output the version number

**Note**: `npm install -g supabase` is no longer supported; use the manual binary installation above.

## Development Commands

### Local Development

Start the dev server (port 3001 by default):

```bash
npm run dev
```

### Building

Production build:

```bash
npm run build
```

### Testing

Run E2E tests with Playwright:

```bash
npm run test:e2e
```

Run the full CI-like workflow locally (seed → build → test → cleanup):

```bash
npm run e2e:run-prod
```

### Linting & Formatting

Check code quality:

```bash
npm run lint
```

Format code with Prettier:

```bash
npm run format
```

## Workflow

### Creating a Feature Branch

Use the project-agent naming convention for feature branches:

```bash
git checkout -b feature/YYYYMMDD-feature-name
```

Example:

```bash
git checkout -b feature/20251116-add-payment-processing
```

### Creating a Pull Request

Use the `gh` CLI (the GitHub Pull Request extension is currently unreliable):

```bash
gh pr create --base master --head feature/YYYYMMDD-feature-name --title "Description of changes" --body "Detailed description"
```

### Before Opening a PR

Always run:

1. Linting: `npm run lint`
1. Build: `npm run build:prod`
1. Tests: `npm run e2e:run-prod` or `npm run test:ci -- --coverage`
1. Format: `npm run format`

Ensure all checks pass before submitting.

## Database Management

### Seeding

Seed the database with template data:

```bash
npm run seed
```

**Note**: Requires `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`.

### Migrations

Create a new migration:

```bash
npm run db:migrate:create -- migration_name
```

Run pending migrations:

```bash
npm run db:migrate:up
```

## PowerShell-First Workflow

All default commands should target **PowerShell** (v7+ recommended):

- Use `Push-Location` / `Set-Location` instead of `cd /d`
- Invoke CLI tools via `node` to avoid `npm.ps1` policy issues
- If another shell is required, open it explicitly

Example:

```powershell
Push-Location D:\path\to\project
npm run build
Pop-Location
```

## MCP Servers & Tools

Activate helpful MCP servers before running the project-agent to maximize automation and memory support:

- **Memory tools** for persistent context across sessions
- **Filesystem tools** for file operations
- **GitHub tools** for PR/issue management

See `.github/agents/assistant.project-agent.agent.md` for full agent configuration.

## Troubleshooting

### "Supabase environment variables are missing"

This error means:

- `NEXT_PUBLIC_SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` are missing from `.env.local`
- Seeds and E2E cleanup will skip

**Solution**: Add the missing variables to `.env.local` from your Supabase dashboard.

### "npm.ps1 is not digitally signed" (PowerShell)

Run `npm run setup-powershell` to set the execution policy for the current user.

### "supabase: The term 'supabase' is not recognized"

The Supabase CLI is not on your `%PATH`. See **Supabase CLI Installation** above.

### Playwright tests fail with "ERR_CONNECTION_REFUSED"

The test baseURL is misconfigured or the dev server didn't start. Ensure:

- `PORT` is set in `.env.local` (defaults to 3000)
- The dev server is running before tests start
- Use relative paths in tests (e.g., `page.goto('/')`)

## Contributing

1. Read the [README.md](../friendly-city-print-shop/README.md) for project architecture
2. Follow the workflow steps above
3. Keep commits atomic and well-described
4. Reference any related issues in PR descriptions

## Support

For questions or issues:

1. Check the README and existing documentation
2. Review the agent instructions in `.github/agents/`
3. Search existing issues on GitHub
4. Open a new issue with a clear description

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Playwright Documentation](https://playwright.dev)
- [GitHub CLI Documentation](https://cli.github.com/manual)
