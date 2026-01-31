@echo off
chcp 65001 >nul
echo ========================================
echo   DIAGNOSTIC BUILD AAB VERSION 4
echo ========================================
echo.

cd /D "C:\Users\berti\jungle-keeper-app"

echo [DIAGNOSTIC] Verification du dossier actuel...
echo    Dossier: %CD%
echo.

echo [1/10] FORCE GIT PULL...
git stash 2>nul
git pull origin main
if errorlevel 1 (
    echo ERREUR: git pull a echoue
    pause
    exit /b 1
)

echo.
echo [2/10] VERIFICATION capacitor.config.ts...
echo    Contenu de capacitor.config.ts:
type capacitor.config.ts
echo.
findstr /C:"versionCode: 4" capacitor.config.ts >nul
if errorlevel 1 (
    echo.
    echo =============================================
    echo ERREUR: versionCode 4 NON TROUVE !
    echo Le git pull n'a pas recupere les bons fichiers.
    echo.
    echo Verifiez que vous avez bien exporte vers GitHub
    echo depuis Lovable avant de faire git pull.
    echo =============================================
    pause
    exit /b 1
)
echo.
echo    ✓ versionCode 4 confirme dans capacitor.config.ts!

echo.
echo [3/10] Fermeture des processus...
taskkill /F /IM studio64.exe /T 2>nul
taskkill /F /IM java.exe /T 2>nul
taskkill /F /IM adb.exe /T 2>nul
taskkill /F /IM gradle.exe /T 2>nul
timeout /t 3 >nul

echo.
echo [4/10] Suppression complete du dossier android...
if exist android (
    attrib -r -h android\*.* /s /d 2>nul
    rmdir /S /Q android 2>nul
)
if exist android (
    echo ERREUR: Impossible de supprimer android
    pause
    exit /b 1
)
echo    ✓ Dossier android supprime

echo.
echo [5/10] Build du projet web...
call npm run build
if errorlevel 1 (
    echo ERREUR: Build web a echoue
    pause
    exit /b 1
)

echo.
echo [6/10] Ajout de la plateforme Android...
call npx cap add android
if errorlevel 1 (
    echo ERREUR: cap add android a echoue
    pause
    exit /b 1
)

echo.
echo [7/10] Configuration SDK...
echo sdk.dir=C:\\Users\\berti\\AppData\\Local\\Android\\Sdk> android\local.properties

echo.
echo [8/10] Synchronisation Android...
call npx cap sync android

echo.
echo [9/10] VERIFICATION build.gradle.kts...
echo    Recherche de versionCode dans build.gradle.kts:
if exist android\app\build.gradle.kts (
    findstr /C:"versionCode" android\app\build.gradle.kts
) else if exist android\app\build.gradle (
    findstr /C:"versionCode" android\app\build.gradle
) else (
    echo    ERREUR: Aucun fichier build.gradle trouve!
)

echo.
echo [10/10] Generation de l'AAB signe...
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
echo IMPORTANT: Le fichier AAB se trouve dans:
echo    android\app\build\outputs\bundle\release\app-release.aab
echo.
explorer "C:\Users\berti\jungle-keeper-app\android\app\build\outputs\bundle\release"
echo.
pause
