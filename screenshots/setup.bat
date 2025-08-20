@echo off
echo 🚀 Setting up TheTool Screenshot Automation...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if package.json exists
if not exist "package.json" (
    echo ❌ package.json not found. Please run this script from the screenshots directory.
    pause
    exit /b 1
)

echo 📦 Installing npm dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install npm dependencies.
    pause
    exit /b 1
)

echo.
echo 🌐 Installing Playwright browsers...
call npx playwright install chromium
if %errorlevel% neq 0 (
    echo ❌ Failed to install Playwright browsers.
    pause
    exit /b 1
)

echo.
echo 📁 Creating output directory...
if not exist "output" mkdir output

echo.
echo ✅ Setup completed successfully!
echo.
echo 📸 You can now run screenshots:
echo    npm run screenshots        # All screenshots
echo    npm run screenshots:popup  # Popup only
echo    npm run screenshots:options # Options only
echo    npm run screenshots:themes  # Themes only
echo    npm run screenshots:promo   # Promo only
echo.
pause
