@echo off
echo ========================================
echo   BUILD ANDROID - Mise a jour S-reptrack
echo ========================================
echo.

cd /d C:\Users\berti\jungle-keeper-app

echo [1/3] Recuperation des modifications...
git pull origin main
if errorlevel 1 (
    echo ERREUR: git pull a echoue
    pause
    exit /b 1
)

echo.
echo [2/3] Build du projet...
call npm run build
if errorlevel 1 (
    echo ERREUR: npm run build a echoue
    pause
    exit /b 1
)

echo.
echo [3/3] Synchronisation Android...
call npx cap sync android
if errorlevel 1 (
    echo ERREUR: cap sync a echoue
    pause
    exit /b 1
)

echo.
echo ========================================
echo   BUILD TERMINE AVEC SUCCES !
echo ========================================
echo.
echo Ouvre maintenant Android Studio et va dans :
echo   Build ^> Generate Signed Bundle / APK
echo.
pause
