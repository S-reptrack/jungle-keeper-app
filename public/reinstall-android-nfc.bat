@echo off
echo ========================================
echo Reinstallation complete Android + NFC Premium
echo ========================================
echo.

cd /d C:\Users\berti\jungle-keeper-app

echo [1/9] Suppression dossier android...
if exist android rmdir /s /q android

echo.
echo [2/9] Verification plugin NFC premium installe...
call npm list @capawesome-team/capacitor-nfc
if errorlevel 1 (
    echo Plugin NFC premium non trouve, installation...
    call npm install @capawesome-team/capacitor-nfc
)

echo.
echo [3/9] Verification ancien plugin desinstalle...
call npm uninstall @exxili/capacitor-nfc 2>nul

echo.
echo [4/9] Build du projet...
call npm run build

echo.
echo [5/9] Ajout plateforme Android...
call npx cap add android

echo.
echo [6/9] Synchronisation Android...
call npx cap sync android

echo.
echo [7/9] Verification plugins installes...
call npx cap ls

echo.
echo [8/9] Ouverture Android Studio...
call npx cap open android

echo.
echo ========================================
echo Reinstallation terminee !
echo ========================================
echo.
echo Dans Android Studio:
echo 1. Attendez que Gradle termine la synchronisation
echo 2. Cliquez sur Run (fleche verte) pour lancer l'app
echo.
pause
