Write-Host "Setting PowerShell execution policy for the current user to RemoteSigned..."
try {
    Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force -ErrorAction Stop
    Write-Host "Execution policy set to RemoteSigned for CurrentUser."
} catch {
    Write-Host "Failed to set execution policy for CurrentUser: $_"
}

Write-Host "Completed PowerShell setup. This script modifies the current user's execution policy to RemoteSigned."
