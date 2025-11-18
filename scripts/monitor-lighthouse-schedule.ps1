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
        # Wait until the scheduled run is completed so artifacts are available
        while ($scheduledRun.status -ne 'completed' -and (Get-Date) -lt $end) {
            Write-Host "Run $($scheduledRun.databaseId) is $($scheduledRun.status). Waiting 20s for completion..."
            Start-Sleep -Seconds 20
            $runsJson = gh run list --workflow="$workflow" --limit 10 --json databaseId,event,status,conclusion,createdAt | ConvertFrom-Json
            $scheduledRun = $runsJson | Where-Object { $_.event -eq 'schedule' } | Sort-Object createdAt | Select-Object -Last 1
        }
        if ($scheduledRun.status -eq 'completed') {
            gh run view $scheduledRun.databaseId --log
            $outdir = "./artifacts/lighthouse-report-$($scheduledRun.databaseId)"
            Write-Host "Downloading artifacts for run $($scheduledRun.databaseId) to $outdir..."
            gh run download $scheduledRun.databaseId --name lighthouse-report --dir $outdir
            Write-Host "Artifact download complete: $outdir"
        }
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
