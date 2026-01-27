@echo off
chcp 65001 >nul
echo ========================================
echo   BUILD AAB POUR PLAY STORE
echo ========================================
echo.

cd /D "C:\Users\berti\jungle-keeper-app"

echo [1/5] Build du projet web...
call npm run build
if errorlevel 1 (
    echo ERREUR: Build web a echoue
    pause
    exit /b 1
)

echo.
echo [2/5] Synchronisation Android...
call npx cap sync android

echo.
echo [3/5] Acces au dossier Android...
cd android

echo.
echo [4/5] Generation de l'AAB signe...
call gradlew bundleRelease -Pandroid.injected.signing.store.file="C:\Users\berti\Documents\sreptrack-release-key.jks" -Pandroid.injected.signing.store.password="SrepTrack2025!" -Pandroid.injected.signing.key.alias="sreptrack" -Pandroid.injected.signing.key.password="SrepTrack2025!"

if errorlevel 1 (
    echo.
    echo ERREUR: Build AAB a echoue
    echo.
    echo Verifiez que JDK 21 est configure dans Android Studio:
    echo   File ^> Settings ^> Build Tools ^> Gradle ^> Gradle JDK ^> 21
    pause
    exit /b 1
)

echo.
echo [5/5] Ouverture du dossier contenant l'AAB...
explorer "C:\Users\berti\jungle-keeper-app\android\app\build\outputs\bundle\release"

echo.
echo ========================================
echo   AAB GENERE AVEC SUCCES !
echo ========================================
echo.
echo Fichier: android\app\build\outputs\bundle\release\app-release.aab
echo.
echo Uploadez ce fichier dans Play Store Console:
echo   Production ^> Creer une version ^> Importer
echo.
pause
