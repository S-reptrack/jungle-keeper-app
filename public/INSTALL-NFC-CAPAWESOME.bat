@echo off
chcp 65001 >nul
echo ========================================
echo Installation NFC Premium Capawesome
echo ========================================
echo.

cd /d C:\Users\berti\jungle-keeper-app

echo [1/6] Git pull pour récupérer les dernières modifications...
git pull

echo.
echo [2/6] Configuration du registre Capawesome...
call npm config set @capawesome-team:registry https://npm.registry.capawesome.io

echo.
echo ========================================
echo IMPORTANT: Entrez votre clé de licence Capawesome
echo (Copiez-collez la clé reçue par email)
echo ========================================
set /p LICENSE_KEY="Clé de licence: "

echo @capawesome-team:registry=https://npm.registry.capawesome.io> .npmrc
echo //npm.registry.capawesome.io/:_authToken=%LICENSE_KEY%>> .npmrc

echo.
echo [3/6] Désinstallation ancien plugin NFC...
call npm uninstall @exxili/capacitor-nfc --legacy-peer-deps

echo.
echo [4/6] Installation plugin NFC Premium...
call npm install @capawesome-team/capacitor-nfc --legacy-peer-deps

echo.
echo [5/6] Build du projet...
call npm run build

echo.
echo [6/6] Synchronisation Android...
call npx cap sync android

echo.
echo ========================================
echo Installation terminée !
echo ========================================
echo.
echo Lancez maintenant: npx cap run android
echo.
pause
