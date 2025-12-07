@echo off
echo ========================================
echo Installation NFC Premium Capawesome
echo ========================================
echo.

cd /d C:\Users\berti\jungle-keeper-app

echo [1/6] Configuration du registre Capawesome...
call npm config set @capawesome-team:registry https://npm.registry.capawesome.dev

echo.
echo ========================================
echo IMPORTANT: Entrez votre cle de licence Capawesome
echo (Elle ressemble a: POLAR-XXXXX-XXXXX-XXXXX-XXXXXXXXXXXX)
echo ========================================
set /p LICENSE_KEY="Collez votre cle ici: "

call npm config set //npm.registry.capawesome.dev/:_authToken %LICENSE_KEY%
call npm config set //npm.registry.capawesome.dev/:always-auth true

echo.
echo [2/6] Desinstallation ancien plugin NFC...
call npm uninstall @exxili/capacitor-nfc

echo.
echo [3/6] Installation plugin NFC Premium...
call npm install @capawesome-team/capacitor-nfc

echo.
echo [4/6] Build du projet...
call npm run build

echo.
echo [5/6] Synchronisation Android...
call npx cap sync android

echo.
echo [6/6] Lancement de l'application...
call npx cap run android

echo.
echo ========================================
echo Installation terminee !
echo ========================================
pause
