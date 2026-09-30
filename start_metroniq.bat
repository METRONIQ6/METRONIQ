@echo off
setlocal DisableDelayedExpansion
cd /d "%~dp0"
echo ===================================================
echo METRONIQ FULLY LOCAL DEVELOPER SERVER
echo ===================================================
echo.

echo [1/4] Checking PostgreSQL...
net start postgresql-x64-15 >nul 2>&1
net start postgresql-x64-16 >nul 2>&1
net start postgresql >nul 2>&1
echo Done.

echo [2/4] Cleaning up existing processes...
FOR /F "tokens=5" %%a IN ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') DO taskkill /f /pid %%a 2>nul
FOR /F "tokens=5" %%a IN ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') DO taskkill /f /pid %%a 2>nul
taskkill /IM cloudflared.exe /F 2>nul

echo [3/4] Starting FastAPI Backend...
start "MetronIQ FastAPI" cmd /c "cd backend && venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000"

echo [4/4] Starting Next.js Frontend...
start "MetronIQ Next.js" cmd /c "cd frontend && npm.cmd run dev"

echo.
echo ===================================================
echo METRONIQ LOCAL SERVICES STARTED
echo ===================================================
echo Frontend: http://localhost:3000
echo Backend:  http://127.0.0.1:8000
echo.
pause
