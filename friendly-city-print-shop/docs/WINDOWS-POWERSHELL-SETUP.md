# Windows PowerShell Setup for Friendly City Print Shop

This project uses npm scripts, nxp and Playwright; some of the standard helpers can require the PowerShell execution policy to be tuned to allow pkg scripts to run without interruption.

Recommended steps for local Windows development:

1. Use PowerShell `Push-Location` instead of `cd /d` in terminal automation and scripts to avoid the interpreter mixing `cd /d` with Windows PowerShell.

1. Set your ExecutionPolicy for the current user to avoid `npm.ps1` being blocked when using `npx` and similar:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force
```

This modifies your current user PowerShell execution policy to allow typical `npm` and `npx` scripts to execute without requiring administrator privileges.

1. Use the included helper script to set up the PowerShell environment for this repository:

```powershell
npm run setup-powershell
```

1. To run E2E locally, prefer the Node-based orchestrator which avoids `start-server-and-test` and potential platform-specific behavior:

```powershell
npm run e2e:run-prod
```

1. If you encounter issues where a previously run server is blocking the port (e.g., 3000), run the provided cleanup script so PowerShell will kill processes listening on the configured port, avoiding usage of deprecated/wmic:

```powershell
npm run clean:win
```

If you prefer to use cmd instead of PowerShell, replace `Push-Location` with `cd /d 'yourpath'` in cmd scripts.
