@echo off
chcp 65001 >nul
echo ========================================
echo   RECONSTRUCTION COMPLETE + NFC PREMIUM
echo   S-reptrack - Double-clic et c'est fait!
echo ========================================
echo.

cd /d C:\Users\berti\jungle-keeper-app

echo [1/12] Sauvegarde des modifications locales...
git stash

echo.
echo [2/12] Mise a jour depuis GitHub...
git pull origin main

echo.
echo [3/12] Nettoyage complet...
if exist android rmdir /s /q android
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json

echo.
echo [4/12] Configuration du registre NFC Premium Capawesome...
echo @capawesome-team:registry=https://npm.registry.capawesome.io> .npmrc
echo //npm.registry.capawesome.io/:_authToken=POLAR-E9FB2266-275B-414A-8C47-E1FF116518B0>> .npmrc

echo.
echo [5/12] Installation des dependances...
call npm install --legacy-peer-deps

echo.
echo [6/12] Desinstallation ancien plugin NFC gratuit...
call npm uninstall @exxili/capacitor-nfc --legacy-peer-deps 2>nul

echo.
echo [7/12] Installation plugin NFC PREMIUM Capawesome...
call npm install @capawesome-team/capacitor-nfc --legacy-peer-deps

echo.
echo [8/12] Build du projet...
call npm run build

echo.
echo [9/12] Ajout plateforme Android + Sync...
call npx cap add android
call npx cap sync android

echo.
echo [10/12] Configuration local.properties...
echo sdk.dir=C:\\Users\\berti\\AppData\\Local\\Android\\Sdk> android\local.properties

echo.
echo [11/12] INSTALLATION DU LOGO S-REPTRACK...
echo Copie du logo dans tous les dossiers mipmap...

set LOGO_SOURCE=src\assets\sreptrack-logo.png
set MIPMAP_BASE=android\app\src\main\res

:: Copier dans tous les dossiers mipmap
for %%D in (mipmap-mdpi mipmap-hdpi mipmap-xhdpi mipmap-xxhdpi mipmap-xxxhdpi) do (
    if exist "%MIPMAP_BASE%\%%D" (
        copy /Y "%LOGO_SOURCE%" "%MIPMAP_BASE%\%%D\ic_launcher.png" >nul 2>&1
        copy /Y "%LOGO_SOURCE%" "%MIPMAP_BASE%\%%D\ic_launcher_round.png" >nul 2>&1
        copy /Y "%LOGO_SOURCE%" "%MIPMAP_BASE%\%%D\ic_launcher_foreground.png" >nul 2>&1
        echo   - %%D : OK
    )
)
echo Logo S-reptrack installe !

echo.
echo [12/12] Synchronisation finale...
call npx cap sync android

echo.
echo ========================================
echo   RECONSTRUCTION TERMINEE AVEC SUCCES!
echo ========================================
echo.
echo Le plugin NFC Premium est maintenant installe.
echo Le logo S-reptrack est maintenant visible !
echo.
echo Prochaine etape: Ouvrir Android Studio
echo.
set /p OPEN_STUDIO="Ouvrir Android Studio maintenant? (O/N): "
if /i "%OPEN_STUDIO%"=="O" (
    call npx cap open android
)
echo.
pause
