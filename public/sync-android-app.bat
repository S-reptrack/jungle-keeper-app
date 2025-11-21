@echo off
echo ========================================
echo Synchronisation de l'application Android
echo ========================================
echo.

cd /d "C:\Users\berti\jungle-keeper-app"

echo Etape 1/4 : Git pull pour recuperer les derniers changements...
git pull
if errorlevel 1 (
    echo ERREUR: Git pull a echoue
    pause
    exit /b 1
)
echo.

echo Etape 2/4 : Installation des dependances...
call npm install
if errorlevel 1 (
    echo ERREUR: npm install a echoue
    pause
    exit /b 1
)
echo.

echo Etape 3/4 : Build du projet...
call npm run build
if errorlevel 1 (
    echo ERREUR: Build a echoue
    pause
    exit /b 1
)
echo.

echo Etape 4/4 : Synchronisation avec Android...
call npx cap sync android
if errorlevel 1 (
    echo ERREUR: Capacitor sync a echoue
    pause
    exit /b 1
)
echo.

echo ========================================
echo SYNCHRONISATION TERMINEE !
echo ========================================
echo.
echo Vous pouvez maintenant relancer l'app Android :
echo - Ouvrez Android Studio
echo - Ou executez : npx cap run android
echo.
pause
