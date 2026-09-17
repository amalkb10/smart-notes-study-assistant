@echo off
echo ========================================================
echo Starting AI Smart Notes & Study Assistant (Full-Stack)
echo ========================================================

start "Smart Notes Backend (FastAPI)" cmd /k "cd /d %~dp0backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"
timeout /t 3 /nobreak >nul
start "Smart Notes Frontend (React + Vite)" cmd /k "cd /d %~dp0frontend && npm.cmd run dev"

echo.
echo Servers launched!
echo - Backend API:  http://localhost:8000
echo - Swagger Docs: http://localhost:8000/docs
echo - Frontend UI:  http://localhost:5173
echo.
pause
