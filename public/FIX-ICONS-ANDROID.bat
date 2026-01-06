@echo off
echo ========================================
echo    Correction des icones Android
echo ========================================
echo.

cd /d "C:\Users\berti\jungle-keeper-app"

echo [1/4] Suppression des icones corrompues...
rmdir /s /q "android\app\src\main\res\mipmap-hdpi" 2>nul
rmdir /s /q "android\app\src\main\res\mipmap-ldpi" 2>nul
rmdir /s /q "android\app\src\main\res\mipmap-mdpi" 2>nul
rmdir /s /q "android\app\src\main\res\mipmap-xhdpi" 2>nul
rmdir /s /q "android\app\src\main\res\mipmap-xxhdpi" 2>nul
rmdir /s /q "android\app\src\main\res\mipmap-xxxhdpi" 2>nul

echo.
echo [2/4] Regeneration de la plateforme Android...
call npx cap update android

echo.
echo [3/4] Synchronisation...
call npx cap sync android

echo.
echo [4/4] Termine!
echo.
echo ========================================
echo    Maintenant, rouvre Android Studio
echo    et relance Build > Generate Signed Bundle
echo ========================================
pause
