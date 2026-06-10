# setup-cron.ps1 — daftarkan Task Scheduler Windows: jalankan deposit-run 4×/hari.
# Jalankan sebagai Administrator:
#   powershell -ExecutionPolicy Bypass -File setup-cron.ps1
# Hapus lagi:
#   powershell -ExecutionPolicy Bypass -File setup-cron.ps1 -Remove

param(
    [string]$TaskName = "BatuApiDeposit",
    [string[]]$Times = @("00:00", "06:00", "12:00", "18:00"),
    [switch]$Remove
)

$ErrorActionPreference = "Stop"
$botDir = $PSScriptRoot
$cmd = Join-Path $botDir "run-deposit.cmd"

if ($Remove) {
    Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue |
        Unregister-ScheduledTask -Confirm:$false
    Write-Host "Task '$TaskName' dihapus (jika ada)."
    return
}

if (-not (Test-Path $cmd)) { throw "run-deposit.cmd tidak ditemukan di $botDir" }

# Empat trigger harian — tiap waktu di $Times.
$triggers = foreach ($t in $Times) {
    New-ScheduledTaskTrigger -Daily -At $t
}

$action = New-ScheduledTaskAction -Execute $cmd -WorkingDirectory $botDir
$settings = New-ScheduledTaskSettingsSet `
    -StartWhenAvailable `
    -DontStopOnIdleEnd `
    -ExecutionTimeLimit (New-TimeSpan -Hours 1)

Register-ScheduledTask -TaskName $TaskName `
    -Trigger $triggers `
    -Action $action `
    -Settings $settings `
    -Description "Deposit 0.001 CELO dari 100 wallet ke kontrak BatuApi (4x/hari)." `
    -Force | Out-Null

Write-Host "Task '$TaskName' terdaftar. Jadwal harian: $($Times -join ', ')."
Write-Host "Cek: Get-ScheduledTask -TaskName $TaskName | Get-ScheduledTaskInfo"
Write-Host "Tes sekarang: Start-ScheduledTask -TaskName $TaskName"
