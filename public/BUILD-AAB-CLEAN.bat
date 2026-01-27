@echo off
chcp 65001 >nul
echo ========================================
echo   BUILD AAB PROPRE POUR PLAY STORE
echo ========================================
echo.

cd /D "C:\Users\berti\jungle-keeper-app"

echo [1/7] Fermeture de TOUS les processus...
taskkill /F /IM studio64.exe /T 2>nul
taskkill /F /IM java.exe /T 2>nul
taskkill /F /IM adb.exe /T 2>nul
taskkill /F /IM gradle.exe /T 2>nul
taskkill /F /IM node.exe /T 2>nul
echo    Attente de 5 secondes...
timeout /t 5 >nul

echo.
echo [2/7] Suppression forcee du dossier android...
if exist android (
    attrib -r -h android\*.* /s /d 2>nul
    rmdir /S /Q android 2>nul
    if exist android (
        echo    Tentative de suppression avec rd...
        rd /S /Q android 2>nul
    )
)
if exist android (
    echo ERREUR: Impossible de supprimer android. Fermez tous les programmes et reessayez.
    pause
    exit /b 1
)
echo    Dossier android supprime.

echo.
echo [3/7] Build du projet web...
call npm run build
if errorlevel 1 (
    echo ERREUR: Build web a echoue
    pause
    exit /b 1
)

echo.
echo [4/7] Ajout de la plateforme Android...
call npx cap add android
if errorlevel 1 (
    echo ERREUR: cap add android a echoue
    pause
    exit /b 1
)

echo.
echo [5/7] Configuration SDK et Manifest...
echo sdk.dir=C:\\Users\\berti\\AppData\\Local\\Android\\Sdk> android\local.properties
if exist public\fix-android-manifest.js (
    call node public\fix-android-manifest.js
)

echo.
echo [6/7] Synchronisation Android...
call npx cap sync android

echo.
echo [7/7] Generation de l'AAB signe...
cd android
if not exist gradlew.bat (
    echo ERREUR: gradlew.bat introuvable dans le dossier android
    pause
    exit /b 1
)
call gradlew.bat bundleRelease -Pandroid.injected.signing.store.file="C:\Users\berti\Documents\sreptrack-release-key.jks" -Pandroid.injected.signing.store.password="SrepTrack2025!" -Pandroid.injected.signing.key.alias="sreptrack" -Pandroid.injected.signing.key.password="SrepTrack2025!"

if errorlevel 1 (
    echo.
    echo ERREUR: Build AAB a echoue
    cd ..
    pause
    exit /b 1
)

cd ..
echo.
echo ========================================
echo   AAB GENERE AVEC SUCCES !
echo ========================================
echo.
explorer "C:\Users\berti\jungle-keeper-app\android\app\build\outputs\bundle\release"
echo.
echo Fichier: android\app\build\outputs\bundle\release\app-release.aab
echo.
pause
