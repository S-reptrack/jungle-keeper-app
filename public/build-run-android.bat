@echo off
setlocal enabledelayedexpansion

REM Update this path if your project is elsewhere
set PROJECT_DIR=C:\Users\berti\jungle-keeper-app

if not exist "%PROJECT_DIR%" (
  echo Project directory not found: %PROJECT_DIR%
  echo Please edit build-run-android.bat and set PROJECT_DIR to your project path.
  pause
  exit /b 1
)

cd /D "%PROJECT_DIR%"

echo Pulling latest code...
git pull

echo Installing dependencies (clean)...
npm ci

echo Building web app...
npm run build

echo Syncing Capacitor Android platform...
npx cap sync android

echo Running on Android (device/emulator)...
npx cap run android

pause
