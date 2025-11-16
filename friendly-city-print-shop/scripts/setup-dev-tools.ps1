<#
  Setup developer tools for Windows with minimal permissions using winget when available.
  This script is idempotent and will only install missing tools.
#>
param(
    [switch]$InstallPlaywrightBrowsers
)

Write-Host "Checking developer tools..."

function Test-CommandExists {
    param([string]$cmd)
    return (Get-Command $cmd -ErrorAction SilentlyContinue) -ne $null
}

if (-not (Test-CommandExists 'gh')) {
    Write-Host "gh CLI not found. Attempting to install with winget..."
    if (Test-CommandExists 'winget') {
        winget install --id GitHub.cli -e --accept-package-agreements --accept-source-agreements
    }
    else {
        Write-Host "winget not available. Please install GitHub CLI manually: https://cli.github.com/"
    }
}
else {
    Write-Host "gh CLI already installed"
}

if (-not (Test-CommandExists 'supabase')) {
    Write-Host "supabase CLI not found. Attempting to install via npm..."
    try {
        npm install -g supabase
    }
    catch {
        Write-Host "Global npm install is no longer supported for the Supabase CLI. Download the latest Windows binary from https://github.com/supabase/cli/releases and add it to your PATH."
    }
}
else {
    Write-Host "supabase CLI already installed"
}

if ($InstallPlaywrightBrowsers) {
    # Install Playwright browsers using npx to ensure runner is present
    Write-Host "Installing Playwright browsers..."
    try { npx playwright install --with-deps } catch { Write-Host "Failed to run playwright install. Ensure node and npm are installed." }
}

Write-Host "Dev tooling setup complete. To set PowerShell execution policy, run: npm run setup-powershell" 
