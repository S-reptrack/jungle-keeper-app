@echo off
setlocal enabledelayedexpansion

REM Patch AndroidManifest.xml automatically using PowerShell
REM Usage: double-click this file OR run from project root: public\fix-android-manifest.bat

cd /D "%~dp0.."
set MANIFEST=android\app\src\main\AndroidManifest.xml

if not exist "%MANIFEST%" (
  echo ❌ AndroidManifest.xml introuvable. Lancez d'abord: npx cap sync android
  pause
  exit /b 1
)

echo 🔧 Mise a jour de %MANIFEST%

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$p='%MANIFEST%'; ^
   $xml = Get-Content -Raw -Path $p; ^
   if ($xml -notmatch 'android\.permission\.CAMERA') { ^
     $xml = $xml -replace '(<manifest[^>]*>)', '$1`n  <!-- Permissions camera ajoutees automatiquement -->`n  <uses-permission android:name="android.permission.CAMERA" />`n  <uses-feature android:name="android.hardware.camera" android:required="false" />`n  <uses-feature android:name="android.hardware.camera.autofocus" android:required="false" />'; ^
   }; ^
   if ($xml -notmatch 'com\.google\.mlkit\.vision\.DEPENDENCIES') { ^
     $xml = $xml -replace '(<application[^>]*>)', '$1`n    <!-- ML Kit ajoute automatiquement -->`n    <meta-data android:name="com.google.mlkit.vision.DEPENDENCIES" android:value="barcode" />'; ^
   }; ^
   Set-Content -Path $p -Value $xml -Encoding UTF8; ^
   Write-Host '✅ AndroidManifest.xml mis a jour'"

if errorlevel 1 (
  echo ❌ Echec de la mise a jour.
  pause
  exit /b 1
)

echo.
echo 📦 Synchronisation Android (Capacitor)...
call npx cap sync android

echo ▶️ Lancement sur Android...
call npx cap run android

echo ✅ Termine. Si la camera etait refusee, autorisez-la dans les Parametres de l'app.
pause
