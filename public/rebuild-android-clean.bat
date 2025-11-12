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

echo Modification d'AndroidManifest.xml...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$p='android\app\src\main\AndroidManifest.xml'; ^
   if (Test-Path $p) { ^
     $xml = Get-Content -Raw -Path $p; ^
     if ($xml -notmatch 'android\.permission\.CAMERA') { ^
       $xml = $xml -replace '(<manifest[^>]*>)', '$1`n  <uses-permission android:name=""android.permission.CAMERA"" />`n  <uses-feature android:name=""android.hardware.camera"" android:required=""false"" />`n  <uses-feature android:name=""android.hardware.camera.autofocus"" android:required=""false"" />'; ^
     }; ^
     if ($xml -notmatch 'com\.google\.mlkit\.vision\.DEPENDENCIES') { ^
       $xml = $xml -replace '(<application[^>]*>)', '$1`n    <meta-data android:name=""com.google.mlkit.vision.DEPENDENCIES"" android:value=""barcode"" />'; ^
     }; ^
     Set-Content -Path $p -Value $xml -Encoding UTF8; ^
     Write-Host 'AndroidManifest.xml configure'; ^
   } else { ^
     Write-Host 'ERREUR: AndroidManifest.xml introuvable'; ^
     exit 1; ^
   }"

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
