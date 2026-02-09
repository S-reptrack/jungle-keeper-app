@echo off
chcp 65001 >nul
echo ========================================
echo   S-REPTRACK - REBUILD COMPLET
echo   Script tout-en-un definitif
echo ========================================
echo.

cd /d "C:\Users\berti\jungle-keeper-app"

echo [1/10] Fermeture des processus...
taskkill /F /IM studio64.exe /T 2>nul
taskkill /F /IM java.exe /T 2>nul
taskkill /F /IM adb.exe /T 2>nul
taskkill /F /IM gradle.exe /T 2>nul
timeout /t 3 >nul

echo.
echo [2/10] Git pull...
git pull origin main
if errorlevel 1 (
    echo ERREUR: git pull a echoue
    pause
    exit /b 1
)

echo.
echo [3/10] Suppression du dossier android...
if exist android (
    attrib -r -h android\*.* /s /d 2>nul
    rmdir /S /Q android 2>nul
)
if exist android (
    echo ERREUR: Impossible de supprimer android. Fermez tous les programmes.
    pause
    exit /b 1
)

echo.
echo [4/10] Nettoyage du cache...
if exist dist rmdir /s /q dist
if exist node_modules\.vite rmdir /s /q node_modules\.vite

echo.
echo [5/10] Installation des dependances...
call npm install --legacy-peer-deps
if errorlevel 1 (
    echo ERREUR: npm install a echoue
    pause
    exit /b 1
)

echo.
echo [6/10] Build du projet...
call npm run build
if errorlevel 1 (
    echo ERREUR: Build a echoue
    pause
    exit /b 1
)

echo.
echo [7/10] Ajout plateforme Android...
call npx cap add android
if errorlevel 1 (
    echo ERREUR: cap add android a echoue
    pause
    exit /b 1
)

echo.
echo [8/10] Configuration SDK + Manifest...
echo sdk.dir=C:\\Users\\berti\\AppData\\Local\\Android\\Sdk> android\local.properties
if exist public\fix-android-manifest.js (
    call node public\fix-android-manifest.js
)

echo.
echo [9/10] Synchronisation Android...
call npx cap sync android

echo.
echo [10/10] Desinstallation ancienne app + Lancement...
adb uninstall com.sreptrack.app 2>nul
call npx cap run android

echo.
echo ========================================
echo   TERMINE !
echo ========================================
pause
