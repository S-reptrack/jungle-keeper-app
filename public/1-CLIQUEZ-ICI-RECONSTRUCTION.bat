@echo off
echo ========================================
echo RECONSTRUCTION COMPLETE ANDROID
echo S-reptrack - Capacitor 8
echo ========================================
echo.

cd /D "C:\Users\berti\jungle-keeper-app"

echo 1/10 - Mise a jour du code...
git stash
git pull

echo 2/10 - Suppression du dossier android...
if exist android rmdir /S /Q android
echo    Dossier android supprime.

echo 3/10 - Suppression de node_modules...
if exist node_modules rmdir /S /Q node_modules
echo    Dossier node_modules supprime.

echo 4/10 - Installation des dependances...
call npm install --legacy-peer-deps
if errorlevel 1 (
    echo ERREUR: npm install a echoue
    pause
    exit /b 1
)

echo 5/10 - Build de l'application...
call npm run build
if errorlevel 1 (
    echo ERREUR: Build a echoue
    pause
    exit /b 1
)

echo 6/10 - Ajout de la plateforme Android...
call npx cap add android
if errorlevel 1 (
    echo ERREUR: cap add android a echoue
    pause
    exit /b 1
)

echo 7/10 - Configuration du SDK Android...
(echo sdk.dir=C:\\Users\\berti\\AppData\\Local\\Android\\Sdk)>android\local.properties
echo    SDK configure dans local.properties

echo 8/10 - Correction du Manifest (CAMERA + NFC + ML Kit)...
node public\fix-android-manifest.js

echo 9/10 - Synchronisation Android...
call npx cap sync android

echo 10/10 - Lancement sur Android...
call npx cap run android

echo.
echo ========================================
echo RECONSTRUCTION TERMINEE !
echo ========================================
pause
