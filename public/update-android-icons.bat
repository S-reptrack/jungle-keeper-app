@echo off
echo ========================================
echo    S-reptrack - Mise a jour des icones
echo ========================================
echo.

cd /d "C:\Users\berti\jungle-keeper-app"

echo Copie du logo S-reptrack vers les dossiers Android...

REM Utilise le meme logo que le header (sreptrack-logo.png)
copy /Y "src\assets\sreptrack-logo.png" "android\app\src\main\res\mipmap-mdpi\ic_launcher.png"
copy /Y "src\assets\sreptrack-logo.png" "android\app\src\main\res\mipmap-hdpi\ic_launcher.png"
copy /Y "src\assets\sreptrack-logo.png" "android\app\src\main\res\mipmap-xhdpi\ic_launcher.png"
copy /Y "src\assets\sreptrack-logo.png" "android\app\src\main\res\mipmap-xxhdpi\ic_launcher.png"
copy /Y "src\assets\sreptrack-logo.png" "android\app\src\main\res\mipmap-xxxhdpi\ic_launcher.png"

REM Copie aussi pour les icones rondes
copy /Y "src\assets\sreptrack-logo.png" "android\app\src\main\res\mipmap-mdpi\ic_launcher_round.png"
copy /Y "src\assets\sreptrack-logo.png" "android\app\src\main\res\mipmap-hdpi\ic_launcher_round.png"
copy /Y "src\assets\sreptrack-logo.png" "android\app\src\main\res\mipmap-xhdpi\ic_launcher_round.png"
copy /Y "src\assets\sreptrack-logo.png" "android\app\src\main\res\mipmap-xxhdpi\ic_launcher_round.png"
copy /Y "src\assets\sreptrack-logo.png" "android\app\src\main\res\mipmap-xxxhdpi\ic_launcher_round.png"

REM Copie pour le foreground (adaptive icons)
copy /Y "src\assets\sreptrack-logo.png" "android\app\src\main\res\mipmap-mdpi\ic_launcher_foreground.png"
copy /Y "src\assets\sreptrack-logo.png" "android\app\src\main\res\mipmap-hdpi\ic_launcher_foreground.png"
copy /Y "src\assets\sreptrack-logo.png" "android\app\src\main\res\mipmap-xhdpi\ic_launcher_foreground.png"
copy /Y "src\assets\sreptrack-logo.png" "android\app\src\main\res\mipmap-xxhdpi\ic_launcher_foreground.png"
copy /Y "src\assets\sreptrack-logo.png" "android\app\src\main\res\mipmap-xxxhdpi\ic_launcher_foreground.png"

echo.
echo Icones copiees!
echo.

echo Rebuild de l'application...
call npm run build
call npx cap sync android

echo.
echo Desinstallation de l'ancienne app...
adb uninstall com.sreptrack.app 2>nul

echo.
echo Lancement sur le telephone...
call npx cap run android

echo.
echo ========================================
echo    Termine!
echo ========================================
pause
