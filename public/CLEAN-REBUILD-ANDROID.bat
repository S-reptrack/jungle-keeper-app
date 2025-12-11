@echo off
echo ========================================
echo    S-reptrack - Nettoyage complet
echo ========================================
echo.

cd /d "C:\Users\berti\jungle-keeper-app"

echo [1/6] Suppression du cache...
if exist "dist" rmdir /s /q dist
if exist "android\app\src\main\assets\public" rmdir /s /q "android\app\src\main\assets\public"
if exist "node_modules\.vite" rmdir /s /q "node_modules\.vite"

echo [2/6] Git pull...
git pull

echo [3/6] Build du projet...
call npm run build
if errorlevel 1 (
    echo ERREUR: Le build a echoue
    pause
    exit /b 1
)

echo [4/6] Synchronisation Android...
call npx cap sync android

echo [5/6] Desinstallation de l'ancienne app...
adb uninstall com.sreptrack.app 2>nul

echo [6/6] Lancement sur le telephone...
call npx cap run android

echo.
echo ========================================
echo    Termine!
echo ========================================
pause
