@echo off
setlocal enabledelayedexpansion

echo Stopping Android Studio and Java processes...
taskkill /F /IM studio64.exe /T >nul 2>&1
taskkill /F /IM java.exe /T >nul 2>&1

echo Removing Android Studio lock files...
if exist "%APPDATA%\Google\AndroidStudio2025.1.4\.lock" del /F /Q "%APPDATA%\Google\AndroidStudio2025.1.4\.lock"
if exist "%LOCALAPPDATA%\Google\AndroidStudio2025.1.4\.port" del /F /Q "%LOCALAPPDATA%\Google\AndroidStudio2025.1.4\.port"

echo Done. You can now build and run the Android app.
pause
