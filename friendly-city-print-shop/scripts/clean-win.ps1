Param(
    [int]$Port = 3000
)

Write-Host "Windows cleanup: Attempting to find processes listening on port $Port..."

try {
    # Prefer modern Get-NetTCPConnection (PowerShell 5.0+ / Windows 10+)
    $tcp = Get-NetTCPConnection -LocalPort $Port -ErrorAction Stop
    foreach ($c in $tcp) {
        if ($c.OwningProcess -ne $null) {
            try {
                Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue
                Write-Host "Stopped process id $($c.OwningProcess) listening on port $Port"
            } catch {
                Write-Host "Failed to stop process id $($c.OwningProcess): $_"
            }
        }
    }
} catch {
    Write-Host "Get-NetTCPConnection unavailable or did not find a matching connection; falling back to WMI process search."
    try {
        $procs = Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -match 'next\s+start' -or $_.CommandLine -match 'node .*scripts/start.js' }
        foreach ($p in $procs) {
            try { Stop-Process -Id $p.ProcessId -Force -ErrorAction SilentlyContinue; Write-Host "Stopped $($p.ProcessId)" } catch { Write-Host "Failed to stop process $($p.ProcessId): $_" }
        }
    } catch {
        Write-Host "Fallback WMI process search also failed or produced no matches: $_"
    }
}

Write-Host "Windows cleanup complete."
