@echo off
cd /d "%~dp0"
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js not found. Please install it from https://nodejs.org
    pause
    exit /b
)

if not exist "node_modules" (
    echo First run - installing dependencies, please wait...
    npm install
)

start "" npx electron .
