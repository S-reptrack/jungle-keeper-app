@echo off
setlocal enabledelayedexpansion

echo ========================================
echo Nettoyage et reconstruction Android
echo ========================================
echo.

REM Fermer Android Studio et Java
echo Fermeture Android Studio et Java...
taskkill /F /IM studio64.exe /T >nul 2>&1
taskkill /F /IM java.exe /T >nul 2>&1

REM Supprimer les verrous
if exist "%APPDATA%\Google\AndroidStudio2025.1.4\.lock" del /F /Q "%APPDATA%\Google\AndroidStudio2025.1.4\.lock" >nul 2>&1
if exist "%LOCALAPPDATA%\Google\AndroidStudio2025.1.4\.port" del /F /Q "%LOCALAPPDATA%\Google\AndroidStudio2025.1.4\.port" >nul 2>&1

REM Aller au dossier du projet
cd /D "C:\Users\berti\jungle-keeper-app"

echo Desinstallation des anciennes versions...
adb uninstall com.ambretixier.sreptrack >nul 2>&1
adb uninstall com.sreptrack.app >nul 2>&1

echo Suppression du dossier android...
if exist android (
  rmdir /S /Q android
)

echo Mise a jour du code...
git pull

echo Installation des dependances...
call npm ci

echo Build de l'application...
call npm run build

echo Ajout de la plateforme Android...
call npx cap add android

echo Creation de local.properties...
(
  echo ## This file must *NOT* be checked into Version Control Systems,
  echo # as it contains information specific to your local configuration.
  echo #
  echo # Location of the SDK. This is only used by Gradle.
  echo # For customization when using a Version Control System, please read the
  echo # header note.
  echo sdk.dir=C:\\Users\\berti\\AppData\\Local\\Android\\Sdk
) > android\local.properties

echo Modification d'AndroidManifest.xml...
node public\fix-android-manifest.js

if errorlevel 1 (
  echo ERREUR lors de la configuration
  pause
  exit /b 1
)


echo Synchronisation Capacitor...
call npx cap sync android

echo.
echo ========================================
echo Lancement sur Android...
echo ========================================
call npx cap run android

echo.
echo Termine !
pause
