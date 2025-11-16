PowerShell Developer Notes
==========================

- Avoid using `cd /d` in PowerShell. `cd /d` is a `cmd.exe` invocation and when used in PowerShell can result in an error like `Cannot find path 'D:\d' because it does not exist`. Instead use:
  - `Set-Location 'D:\path\to\repo'`
  - or `cd 'D:\path\to\repo'` (no `/d` option)

- We provide a helper script to configure PowerShell for development for the current user (Local = CurrentUser). To set the policy run:
  - `npm run setup-powershell`
  - or run `./scripts/setup-powershell-env.ps1` manually using PowerShell.

- If you still see `npm.ps1 cannot be loaded` errors, that usually indicates your PowerShell is restricted by policy at a higher scope or the `npm` alias is blocked; check `Get-ExecutionPolicy -List` and talk to your admin.

- Running commands that rely on `cmd.exe` features like `/d` should be executed under `cmd`, i.e.
  - `cmd /c "cd /d D:\path\to\repo && npm run e2e:run-prod"`

This repository uses `node`-based `scripts` that are usually shell-agnostic; prefer `npm run <script>` over manual `cd` commands where possible.
