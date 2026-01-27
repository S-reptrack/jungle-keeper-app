@echo off
chcp 65001 >nul
echo ========================================
echo   RECONSTRUCTION COMPLETE S-reptrack
echo ========================================
echo.

cd /D "C:\Users\berti\jungle-keeper-app"

echo [1/10] Fermeture Android Studio...
taskkill /F /IM studio64.exe /T 2>nul
taskkill /F /IM java.exe /T 2>nul
timeout /t 2 >nul

echo.
echo [2/10] Mise a jour du code...
git stash 2>nul
git pull

echo.
echo [3/10] Suppression du dossier android...
if exist android rmdir /S /Q android

echo.
echo [4/10] Nettoyage du cache...
if exist dist rmdir /S /Q dist
if exist node_modules\.vite rmdir /S /Q node_modules\.vite

echo.
echo [5/10] Build du projet web...
call npm run build
if errorlevel 1 (
    echo ERREUR: Build a echoue
    pause
    exit /b 1
)

echo.
echo [6/10] Ajout de la plateforme Android...
call npx cap add android

echo.
echo [7/10] Configuration SDK...
echo sdk.dir=C:\\Users\\berti\\AppData\\Local\\Android\\Sdk> android\local.properties

echo.
echo [8/10] Correction du Manifest (CAMERA + NFC + ML Kit)...
call node public\fix-android-manifest.js

echo.
echo [9/10] Copie du logo S-reptrack...
if exist src\assets\sreptrack-logo.png (
    copy /Y "src\assets\sreptrack-logo.png" "android\app\src\main\res\mipmap-mdpi\ic_launcher.png" >nul
    copy /Y "src\assets\sreptrack-logo.png" "android\app\src\main\res\mipmap-hdpi\ic_launcher.png" >nul
    copy /Y "src\assets\sreptrack-logo.png" "android\app\src\main\res\mipmap-xhdpi\ic_launcher.png" >nul
    copy /Y "src\assets\sreptrack-logo.png" "android\app\src\main\res\mipmap-xxhdpi\ic_launcher.png" >nul
    copy /Y "src\assets\sreptrack-logo.png" "android\app\src\main\res\mipmap-xxxhdpi\ic_launcher.png" >nul
    copy /Y "src\assets\sreptrack-logo.png" "android\app\src\main\res\mipmap-mdpi\ic_launcher_round.png" >nul
    copy /Y "src\assets\sreptrack-logo.png" "android\app\src\main\res\mipmap-hdpi\ic_launcher_round.png" >nul
    copy /Y "src\assets\sreptrack-logo.png" "android\app\src\main\res\mipmap-xhdpi\ic_launcher_round.png" >nul
    copy /Y "src\assets\sreptrack-logo.png" "android\app\src\main\res\mipmap-xxhdpi\ic_launcher_round.png" >nul
    copy /Y "src\assets\sreptrack-logo.png" "android\app\src\main\res\mipmap-xxxhdpi\ic_launcher_round.png" >nul
    copy /Y "src\assets\sreptrack-logo.png" "android\app\src\main\res\mipmap-mdpi\ic_launcher_foreground.png" >nul
    copy /Y "src\assets\sreptrack-logo.png" "android\app\src\main\res\mipmap-hdpi\ic_launcher_foreground.png" >nul
    copy /Y "src\assets\sreptrack-logo.png" "android\app\src\main\res\mipmap-xhdpi\ic_launcher_foreground.png" >nul
    copy /Y "src\assets\sreptrack-logo.png" "android\app\src\main\res\mipmap-xxhdpi\ic_launcher_foreground.png" >nul
    copy /Y "src\assets\sreptrack-logo.png" "android\app\src\main\res\mipmap-xxxhdpi\ic_launcher_foreground.png" >nul
    echo    Logo copie dans tous les dossiers mipmap
)

echo.
echo [10/10] Synchronisation Android...
call npx cap sync android

echo.
echo ========================================
echo   RECONSTRUCTION TERMINEE !
echo ========================================
echo.
echo Desinstallation de l'ancienne app...
adb uninstall com.sreptrack.app 2>nul

echo.
echo Lancement sur le telephone...
call npx cap run android

echo.
pause
