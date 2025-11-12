@echo off
echo ========================================
echo RECONSTRUCTION ANDROID - S-reptrack
echo ========================================
echo.

cd /D "C:\Users\berti\jungle-keeper-app"

echo 1/7 - Mise a jour du code...
git pull

echo 2/7 - Nettoyage des dependances...
if exist node_modules rmdir /S /Q node_modules

echo 3/7 - Installation des dependances...
call npm install

echo 4/7 - Build de l'application...
call npm run build

echo 5/7 - Mise a jour Android...
call npx cap update android

echo 6/7 - Synchronisation Android...
call npx cap sync android

echo 7/7 - Lancement sur Android...
call npx cap run android

echo.
echo ========================================
echo TERMINE !
echo ========================================
pause
