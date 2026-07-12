@echo off
echo ==========================================
echo Starting Local AI Triage Server...
echo ==========================================
echo.
echo Step 1: Installing Required Python Packages...
pip install fastapi uvicorn transformers torch pydantic

echo.
echo Step 2: Starting the AI Model...
python run_model.py

pause
