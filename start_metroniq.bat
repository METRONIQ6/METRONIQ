@echo off
setlocal DisableDelayedExpansion
cd /d "%~dp0"
echo ===================================================
echo METRONIQ SELF-HOSTED DEMO BACKEND (One-Click)
echo ===================================================
echo.

echo [1/9] Checking PostgreSQL...
net start postgresql-x64-15 >nul 2>&1
net start postgresql-x64-16 >nul 2>&1
net start postgresql >nul 2>&1
echo Done.

if not exist cloudflared.exe (
    echo [2/9] Downloading cloudflared...
    powershell -NoProfile -Command "Invoke-WebRequest -Uri 'https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe' -OutFile 'cloudflared.exe'"
) else (
    echo [2/9] cloudflared is ready.
)

echo [3/9] Cleaning up existing processes...
FOR /F "tokens=5" %%a IN ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') DO taskkill /f /pid %%a 2>nul
taskkill /IM cloudflared.exe /F 2>nul
del tunnel.log 2>nul
del uvicorn.log 2>nul
del url.tmp 2>nul

echo [4/9] Starting FastAPI Backend...
start /B "MetronIQ FastAPI" cmd /c "cd backend && venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 > ../uvicorn.log 2>&1 <NUL"

echo Waiting for FastAPI to initialize (health check)...
set max_retries=90
set count=0
:wait_fastapi
set /a count+=1
if %count% gtr %max_retries% (
    echo [ERROR] FastAPI failed to start or timed out.!
    echo Please check uvicorn.log for details.
    type uvicorn.log
    pause
    exit /b 1
)
curl -s -f http://127.0.0.1:8000/api/health >nul 2>&1
if %errorlevel% neq 0 (
    ping 127.0.0.1 -n 2 >nul
    goto wait_fastapi
)
echo FastAPI is healthy!

echo.
echo [5/9] Starting Cloudflare Tunnel...
start /B "Cloudflare Tunnel" cmd /c "cloudflared.exe tunnel --url http://127.0.0.1:8000 2> tunnel.log <NUL"

echo Waiting for Cloudflare Tunnel URL...
:waiturl
ping 127.0.0.1 -n 3 >nul
if not exist tunnel.log goto waiturl
findstr "trycloudflare.com" tunnel.log >url.tmp 2>nul
for /f "tokens=*" %%a in (url.tmp) do set TUNNEL_LINE=%%a
if "%TUNNEL_LINE%"=="" goto waiturl

for /f "usebackq tokens=*" %%a in (`powershell -NoProfile -Command "Select-String -Path tunnel.log -Pattern 'https://[a-zA-Z0-9-]+\.trycloudflare\.com' | ForEach-Object { $_.Matches.Value } | Select-Object -Last 1"`) do set PUBLIC_URL=%%a

if "%PUBLIC_URL%"=="" goto waiturl

echo Generated URL: %PUBLIC_URL%

echo Verifying Tunnel accessibility (this checks if it is fully active online)...
set p_count=0
:wait_tunnel
set /a p_count+=1
if %p_count% gtr 60 (
    echo [ERROR] Tunnel URL %PUBLIC_URL% is unreachable!
    pause
    exit /b 1
)
curl -s -f %PUBLIC_URL%/api/health >nul 2>&1
if %errorlevel% neq 0 (
    ping 127.0.0.1 -n 3 >nul
    goto wait_tunnel
)
echo Tunnel is verified!

echo.
echo [6/9] Synchronizing with Vercel Production...
cmd /c "npx vercel env rm NEXT_PUBLIC_API_URL production -y >nul 2>&1"
echo | set /p="%PUBLIC_URL%" > url_no_newline.tmp
type url_no_newline.tmp | cmd /c "npx vercel env add NEXT_PUBLIC_API_URL production"
if %errorlevel% neq 0 (
    echo [ERROR] Failed to update Vercel environment variable.
    pause
    exit /b 1
)

echo.
echo [7/9] Deploying to Vercel (This will take 1-2 minutes)...
echo Deploying new Vercel production build...
cmd /c "npx vercel --prod --yes > vercel_deploy.log 2>&1"
if %errorlevel% neq 0 (
    echo [ERROR] Vercel deployment failed! 
    echo Please check vercel_deploy.log for details.
    type vercel_deploy.log
    pause
    exit /b 1
)

echo.
echo [8/9] Verifying Vercel Deployment configuration...
curl -s -o /dev/null -w "%%{http_code}" https://metroniq.vercel.app > vercel_status.tmp
set /p VERCEL_STATUS=<vercel_status.tmp
if not "%VERCEL_STATUS%"=="200" (
    echo [ERROR] Vercel frontend returned HTTP %VERCEL_STATUS%.
    pause
    exit /b 1
)
echo Vercel is returning 200 OK!

echo.
echo [9/9] Deployment successful!
start https://metroniq.vercel.app

echo.
echo ===================================================
echo METRONIQ IS READY - OPEN THE BROWSER AND LOGIN.
echo ===================================================
echo Keep this terminal window open to keep the backend running.
echo To exit securely, press Ctrl+C or close this window.
pause
