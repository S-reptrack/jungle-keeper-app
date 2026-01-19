@echo off
echo ========================================
echo RECONSTRUCTION ANDROID - S-reptrack
echo ========================================
echo.

cd /D "C:\Users\berti\jungle-keeper-app"

echo 1/8 - Mise a jour du code...
git pull

echo 2/8 - Nettoyage des dependances...
if exist node_modules rmdir /S /Q node_modules

echo 3/8 - Installation des dependances (avec legacy-peer-deps)...
call npm install --legacy-peer-deps

echo 4/8 - Build de l'application...
call npm run build

echo 5/8 - Mise a jour Android...
call npx cap update android

echo 6/8 - Correction du Manifest (CAMERA + ML Kit)...
node public\fix-android-manifest.js

echo 7/8 - Synchronisation Android...
call npx cap sync android

echo 8/8 - Lancement sur Android...
call npx cap run android

echo.
echo ========================================
echo TERMINE !
echo ========================================
pause
