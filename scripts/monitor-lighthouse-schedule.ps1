param(
    [int]$TimeoutMinutes = 60
)
$end = (Get-Date).AddMinutes($TimeoutMinutes)
$workflow = 'lighthouse.yml'
Write-Host "Monitoring scheduled runs for $workflow for $TimeoutMinutes minutes..."
while ((Get-Date) -lt $end) {
    $runsJson = gh run list --workflow="$workflow" --limit 10 --json databaseId,event,status,conclusion,createdAt | ConvertFrom-Json
    $scheduledRun = $runsJson | Where-Object { $_.event -eq 'schedule' } | Sort-Object createdAt | Select-Object -Last 1
    if ($null -ne $scheduledRun) {
        Write-Host "Found schedule run: ID:$($scheduledRun.databaseId) Event:$($scheduledRun.event) Status:$($scheduledRun.status) Conclusion:$($scheduledRun.conclusion) Created:$($scheduledRun.createdAt)"
        gh run view $scheduledRun.databaseId --log
        break
    }
    else {
        Write-Host "No scheduled run detected yet - waiting 30s..."
        Start-Sleep -Seconds 30
    }
}
if ((Get-Date) -ge $end) {
    Write-Host "Timeout reached ($TimeoutMinutes minutes); no scheduled runs were detected."
}
