@echo off
chcp 65001 >nul
echo ========================================
echo   RECONSTRUCTION COMPLETE - Fix Gradle
echo ========================================
echo.

echo [1/8] Fermeture de tous les processus...
taskkill /F /IM studio64.exe /T 2>nul
taskkill /F /IM java.exe /T 2>nul
timeout /t 3 >nul

echo.
echo [2/8] Suppression du cache Gradle global...
if exist "%USERPROFILE%\.gradle\caches" rmdir /S /Q "%USERPROFILE%\.gradle\caches"
if exist "%USERPROFILE%\.gradle\daemon" rmdir /S /Q "%USERPROFILE%\.gradle\daemon"
if exist "%USERPROFILE%\.gradle\wrapper" rmdir /S /Q "%USERPROFILE%\.gradle\wrapper"

echo.
echo [3/8] Suppression du dossier android...
cd /D "C:\Users\berti\jungle-keeper-app"
if exist android rmdir /S /Q android

echo.
echo [4/8] Git pull...
git stash 2>nul
git pull

echo.
echo [5/8] Build du projet web...
call npm run build
if errorlevel 1 (
    echo ERREUR: Build a echoue
    pause
    exit /b 1
)

echo.
echo [6/8] Ajout de la plateforme Android...
call npx cap add android

echo.
echo [7/8] Configuration SDK et Manifest...
echo sdk.dir=C:\\Users\\berti\\AppData\\Local\\Android\\Sdk> android\local.properties
call node public\fix-android-manifest.js

echo.
echo [8/8] Synchronisation Android...
call npx cap sync android

echo.
echo ========================================
echo   RECONSTRUCTION TERMINEE !
echo ========================================
echo.
echo Maintenant, ouvrez Android Studio et ouvrez le projet:
echo   C:\Users\berti\jungle-keeper-app\android
echo.
echo IMPORTANT: Dans Android Studio, allez dans:
echo   File ^> Settings ^> Build Tools ^> Gradle
echo   Et selectionnez JDK 17 (pas JDK 21)
echo.
pause
