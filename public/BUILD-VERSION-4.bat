@echo off
chcp 65001 >nul
echo ========================================
echo   BUILD AAB VERSION 4 - FORCE UPDATE
echo ========================================
echo.

cd /D "C:\Users\berti\jungle-keeper-app"

echo [1/8] FORCE GIT PULL...
git stash 2>nul
git pull origin main
if errorlevel 1 (
    echo ERREUR: git pull a echoue
    pause
    exit /b 1
)

echo.
echo [2/8] Verification du versionCode...
findstr /C:"versionCode: 4" capacitor.config.ts >nul
if errorlevel 1 (
    echo ERREUR: versionCode 4 non trouve dans capacitor.config.ts
    echo Le git pull n'a pas fonctionne correctement
    pause
    exit /b 1
)
echo    versionCode 4 confirme!

echo.
echo [3/8] Fermeture des processus...
taskkill /F /IM studio64.exe /T 2>nul
taskkill /F /IM java.exe /T 2>nul
taskkill /F /IM adb.exe /T 2>nul
taskkill /F /IM gradle.exe /T 2>nul
timeout /t 3 >nul

echo.
echo [4/8] Suppression complete du dossier android...
if exist android (
    attrib -r -h android\*.* /s /d 2>nul
    rmdir /S /Q android 2>nul
)
if exist android (
    echo ERREUR: Impossible de supprimer android
    pause
    exit /b 1
)

echo.
echo [5/8] Build du projet web...
call npm run build
if errorlevel 1 (
    echo ERREUR: Build web a echoue
    pause
    exit /b 1
)

echo.
echo [6/8] Ajout de la plateforme Android...
call npx cap add android
if errorlevel 1 (
    echo ERREUR: cap add android a echoue
    pause
    exit /b 1
)

echo.
echo [7/8] Configuration et synchronisation...
echo sdk.dir=C:\\Users\\berti\\AppData\\Local\\Android\\Sdk> android\local.properties
call npx cap sync android

echo.
echo [8/8] Generation de l'AAB signe...
cd android
call gradlew.bat bundleRelease -Pandroid.injected.signing.store.file="C:\Users\berti\Documents\sreptrack-release-key.jks" -Pandroid.injected.signing.store.password="SrepTrack2025!" -Pandroid.injected.signing.key.alias="key0" -Pandroid.injected.signing.key.password="SrepTrack2025!"

if errorlevel 1 (
    echo ERREUR: Build AAB a echoue
    cd ..
    pause
    exit /b 1
)

cd ..
echo.
echo ========================================
echo   AAB VERSION 4 GENERE AVEC SUCCES !
echo ========================================
echo.
explorer "C:\Users\berti\jungle-keeper-app\android\app\build\outputs\bundle\release"
echo.
pause
