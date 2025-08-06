@echo off
echo 🧹 Cleaning up existing Node.js processes...
taskkill /f /im node.exe >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Cleaned up existing Node.js processes
) else (
    echo ℹ️  No existing Node.js processes found
)

echo.
echo 🚀 Starting DevHub server...
cd /d "%~dp0"
npm run server:dev

pause
