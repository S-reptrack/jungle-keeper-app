@echo off
chcp 65001 >nul
echo ========================================
echo Installation NFC Premium Capawesome
echo ========================================
echo.

cd /d C:\Users\berti\jungle-keeper-app

echo [1/7] Nettoyage node_modules...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json

echo.
echo [2/7] Nettoyage anciennes configurations npm...
call npm config delete @capawesome-team:registry 2>nul

echo.
echo [3/7] Configuration du registre Capawesome (.io)...
call npm config set @capawesome-team:registry https://npm.registry.capawesome.io

echo.
echo ========================================
echo IMPORTANT: Entrez votre cle de licence Capawesome
echo ========================================
set /p LICENSE_KEY="Collez votre cle ici: "

echo.
echo [4/7] Creation du fichier .npmrc avec la cle...
echo @capawesome-team:registry=https://npm.registry.capawesome.io> .npmrc
echo //npm.registry.capawesome.io/:_authToken=%LICENSE_KEY%>> .npmrc

echo.
echo [5/7] Installation des dependances...
call npm install --legacy-peer-deps

echo.
echo [6/7] Installation plugin NFC Premium (compatible Capacitor 7)...
call npm install @capawesome-team/capacitor-nfc --legacy-peer-deps
call npm uninstall @exxili/capacitor-nfc --legacy-peer-deps

echo.
echo [7/7] Build et synchronisation Android...
call npm run build
call npx cap sync android

echo.
echo ========================================
echo Installation terminee !
echo ========================================
echo.
echo Lancez maintenant: npx cap run android
echo.
pause
