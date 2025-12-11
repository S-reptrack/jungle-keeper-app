@echo off
echo ========================================
echo    S-reptrack - Lancement sur mobile
echo ========================================
echo.

cd /d "C:\Users\berti\jungle-keeper-app"

echo [1/3] Build du projet...
call npm run build
if errorlevel 1 (
    echo ERREUR: Le build a echoue
    pause
    exit /b 1
)

echo.
echo [2/3] Synchronisation Capacitor...
call npx cap sync android
if errorlevel 1 (
    echo ERREUR: La synchronisation a echoue
    pause
    exit /b 1
)

echo.
echo [3/3] Lancement sur le telephone...
call npx cap run android
if errorlevel 1 (
    echo ERREUR: Le lancement a echoue
    echo Verifie que ton telephone est bien connecte en mode debogage USB
    pause
    exit /b 1
)

echo.
echo ========================================
echo    Application lancee avec succes!
echo ========================================
pause
