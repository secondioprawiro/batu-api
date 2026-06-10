@echo off
REM Wrapper untuk Task Scheduler — pindah ke folder bot lalu jalankan deposit run.
cd /d "%~dp0"
node deposit-run.js
