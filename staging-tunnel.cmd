@echo off
REM ============================================================
REM  MHS Wellness Center — staging database tunnel (keep OPEN)
REM
REM  The staging Postgres (Wellness_Center_staging) is reachable
REM  ONLY through this SSH tunnel — port 5432 is never public
REM  (see the "DB Access Developer Guide"). The app connects to
REM  127.0.0.1:5432, which this window provides.
REM
REM  Double-click to start. It reconnects by itself if the line
REM  drops. Close the window to disconnect the app from staging.
REM
REM  To start automatically with Windows: press Win+R, type
REM  shell:startup, and put a shortcut to this file there.
REM ============================================================
:loop
echo [%date% %time%] connecting staging tunnel...
ssh -i "%USERPROFILE%\.ssh\id_ed25519" -N -L 5432:127.0.0.1:5432 -o StrictHostKeyChecking=accept-new -o ServerAliveInterval=15 -o ServerAliveCountMax=3 -o ExitOnForwardFailure=yes ubuntu@15.252.10.156
echo [%date% %time%] tunnel dropped — reconnecting in 5 seconds...
timeout /t 5 /nobreak >nul
goto loop
