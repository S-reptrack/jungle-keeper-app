@echo off
echo ========================================
echo    Fix icones Android - S-reptrack
echo ========================================
echo.

cd /d "C:\Users\berti\jungle-keeper-app"

set LOGO=src\assets\sreptrack-logo.png
set RES=android\app\src\main\res

echo Copie du logo dans tous les dossiers mipmap...
for %%D in (mipmap-mdpi mipmap-hdpi mipmap-xhdpi mipmap-xxhdpi mipmap-xxxhdpi) do (
    if not exist "%RES%\%%D" mkdir "%RES%\%%D"
    copy /Y "%LOGO%" "%RES%\%%D\ic_launcher.png" >nul
    copy /Y "%LOGO%" "%RES%\%%D\ic_launcher_round.png" >nul
    copy /Y "%LOGO%" "%RES%\%%D\ic_launcher_foreground.png" >nul
    echo   %%D : OK
)

echo.
echo ========================================
echo    Icones restaurees !
echo    Relancez: npx cap run android
echo ========================================
pause
