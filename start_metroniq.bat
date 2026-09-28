@echo off
setlocal
echo ===================================================
echo METRONIQ SELF-HOSTED DEMO BACKEND (Friend's Laptop)
echo ===================================================
echo.

:: 1. Download cloudflared if not present
if not exist cloudflared.exe (
    echo Downloading cloudflared...
    powershell -Command "Invoke-WebRequest -Uri 'https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe' -OutFile 'cloudflared.exe'"
)

:: 2. Kill existing processes on port 8000
echo Stopping any existing conflicting processes...
FOR /F "tokens=5" %%a IN ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') DO taskkill /f /pid %%a 2>nul
taskkill /IM cloudflared.exe /F 2>nul
del tunnel.log 2>nul

:: 3. Start FastAPI Backup
echo Starting FastAPI Backend...
start "MetronIQ FastAPI" cmd /c "cd backend && venv\Scripts\activate && uvicorn app.main:app --host 127.0.0.1 --port 8000"

:: 4. Start Cloudflared Tunnel
echo Starting Cloudflare Tunnel...
start "Cloudflare Tunnel" cmd /c "cloudflared.exe tunnel --url http://127.0.0.1:8000 2> tunnel.log"

:: 5. Wait for the ephemeral URL
echo Waiting for Cloudflare Tunnel to initialize...
:waiturl
timeout /t 2 /nobreak >nul
if not exist tunnel.log goto waiturl
findstr "trycloudflare.com" tunnel.log >url.tmp
for /f "tokens=*" %%a in (url.tmp) do set TUNNEL_LINE=%%a
if "%TUNNEL_LINE%"=="" goto waiturl

:: 6. Parse URL
for /f "usebackq tokens=*" %%a in (`powershell -Command "Select-String -Path tunnel.log -Pattern 'https://[a-zA-Z0-9-]+\.trycloudflare\.com' | ForEach-Object { $_.Matches.Value }"`) do set PUBLIC_URL=%%a

echo.
echo ==============================================================
echo                      TUNNEL IS READY!
echo ==============================================================
echo The FastAPI backend is running locally.
echo Cloudflare Tunnel has securely exposed it at:
echo.
echo    %PUBLIC_URL%
echo.
echo IMPORTANT FRONTEND CONFIGURATION:
echo 1. Go to your Vercel Project Dashboard for MetronIQ.
echo 2. Navigate to Settings -^> Environment Variables.
echo 3. Add or update the variable:
echo      Name: NEXT_PUBLIC_API_URL
echo      Value: %PUBLIC_URL%
echo 4. Go to Vercel Deployments and REDEPLOY the app to apply it.
echo.
echo Leave this script window open. Close it to stop the server!
echo ==============================================================
pause
