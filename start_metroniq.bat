@echo off
echo Killing existing Node.js and Python API processes if running...
FOR /F "tokens=5" %%a IN ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') DO taskkill /f /pid %%a 2>nul
FOR /F "tokens=5" %%a IN ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') DO taskkill /f /pid %%a 2>nul

echo Starting FastAPI Backend in a new window...
start cmd /k "cd backend && venv\Scripts\activate && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

echo Starting Next.js Frontend in a new window...
start cmd /k "cd frontend && npm run dev"

echo MetronIQ successfully launched!
exit

