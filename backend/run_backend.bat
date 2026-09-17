@echo off
echo ========================================================
echo Starting AI Smart Notes / Study Assistant - Backend
echo ========================================================
cd /d "%~dp0"
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
pause
