@echo off
REM Azlan Autos Backend - Quick Start Script

echo.
echo ========================================
echo  Azlan Autos POS - Backend Setup
echo ========================================
echo.

REM Check if Node.js is installed
node -v >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Download from: https://nodejs.org
    pause
    exit /b 1
)

echo [OK] Node.js installed: 
node -v
echo.

REM Check if npm is installed
npm -v >nul 2>&1
if errorlevel 1 (
    echo ERROR: npm is not installed!
    pause
    exit /b 1
)

echo [OK] npm installed: 
npm -v
echo.

REM Install dependencies
echo Installing dependencies...
npm install

if errorlevel 1 (
    echo ERROR: Failed to install dependencies!
    pause
    exit /b 1
)

echo.
echo ========================================
echo [SUCCESS] Setup complete!
echo ========================================
echo.
echo Start options:
echo   1. Development (with auto-reload):
echo      npm run dev
echo.
echo   2. Production:
echo      npm start
echo.
echo ========================================
echo.
pause
