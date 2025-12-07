@echo off
echo ========================================
echo Installation NFC Premium Capawesome
echo ========================================
echo.

cd /d C:\Users\berti\jungle-keeper-app

echo [1/7] Nettoyage node_modules...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json

echo.
echo [2/7] Configuration du registre Capawesome...
call npm config set @capawesome-team:registry https://npm.registry.capawesome.dev

echo.
echo ========================================
echo IMPORTANT: Entrez votre cle de licence Capawesome
echo (Exemple: POLAR-E9FB2266-275B-414A-8C47-E1FF116518B0)
echo ========================================
set /p LICENSE_KEY="Collez votre cle ici: "

call npm config set //npm.registry.capawesome.dev/:_authToken %LICENSE_KEY%

echo.
echo [3/7] Installation des dependances...
call npm install

echo.
echo [4/7] Installation plugin NFC Premium...
call npm install @capawesome-team/capacitor-nfc

echo.
echo [5/7] Desinstallation ancien plugin NFC gratuit...
call npm uninstall @exxili/capacitor-nfc

echo.
echo [6/7] Build du projet...
call npm run build

echo.
echo [7/7] Synchronisation et lancement Android...
call npx cap sync android
call npx cap run android

echo.
echo ========================================
echo Installation terminee !
echo ========================================
pause
