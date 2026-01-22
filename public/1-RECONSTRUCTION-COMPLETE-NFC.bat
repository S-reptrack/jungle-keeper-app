@echo off
chcp 65001 >nul
echo ========================================
echo   RECONSTRUCTION COMPLETE + NFC PREMIUM
echo   S-reptrack - Double-clic et c'est fait!
echo ========================================
echo.

cd /d C:\Users\berti\jungle-keeper-app

echo [1/10] Sauvegarde des modifications locales...
git stash

echo.
echo [2/10] Mise a jour depuis GitHub...
git pull origin main

echo.
echo [3/10] Nettoyage complet...
if exist android rmdir /s /q android
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json

echo.
echo [4/10] Configuration du registre NFC Premium Capawesome...
echo @capawesome-team:registry=https://npm.registry.capawesome.io> .npmrc
echo //npm.registry.capawesome.io/:_authToken=POLAR-E9FB2266-275B-414A-8C47-E1FF116518B0>> .npmrc

echo.
echo [5/10] Installation des dependances...
call npm install --legacy-peer-deps

echo.
echo [6/10] Desinstallation ancien plugin NFC gratuit...
call npm uninstall @exxili/capacitor-nfc --legacy-peer-deps 2>nul

echo.
echo [7/10] Installation plugin NFC PREMIUM Capawesome...
call npm install @capawesome-team/capacitor-nfc --legacy-peer-deps

echo.
echo [8/10] Build du projet...
call npm run build

echo.
echo [9/10] Ajout plateforme Android + Sync...
call npx cap add android
call npx cap sync android

echo.
echo [10/10] Configuration local.properties...
echo sdk.dir=C:\\Users\\berti\\AppData\\Local\\Android\\Sdk> android\local.properties

echo.
echo ========================================
echo   RECONSTRUCTION TERMINEE AVEC SUCCES!
echo ========================================
echo.
echo Le plugin NFC Premium est maintenant installe.
echo.
echo Prochaine etape: Ouvrir Android Studio
echo.
set /p OPEN_STUDIO="Ouvrir Android Studio maintenant? (O/N): "
if /i "%OPEN_STUDIO%"=="O" (
    call npx cap open android
)
echo.
pause
