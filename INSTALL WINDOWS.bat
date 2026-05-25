@echo off
title Installing Motionreis Plugin
echo =====================================================
echo         INSTALLING MOTIONREIS PLUGIN (WINDOWS)       
echo =====================================================
echo.

:: 1. Enable PlayerDebugMode so unsigned plugins can run
echo [1/2] Enabling Adobe PlayerDebugMode...
FOR %%i IN (11, 12, 13, 14, 15, 16, 17, 18) DO (
    REG ADD "HKCU\Software\Adobe\CSXS.%%i" /v PlayerDebugMode /t REG_SZ /d "1" /f >nul 2>&1
)
echo       Done!

:: 2. Clean up old conflicting installations and cache
echo [2/3] Cleaning up old conflicting installations ^& cache...
rmdir /S /Q "%APPDATA%\Adobe\CEP\extensions\com.motionreis.master" >nul 2>&1
rmdir /S /Q "%APPDATA%\Adobe\CEP\extensions\motionreis" >nul 2>&1
rmdir /S /Q "%LOCALAPPDATA%\Temp\cep_cache" >nul 2>&1
echo       Done!

:: 3. Copy the plugin folder to the CEP extensions directory
echo [3/3] Syncing files to Adobe CEP directory (Safe Overwrite)...
set "EXT_DIR=%APPDATA%\Adobe\CEP\extensions\com.motionreis.suite"

:: Copy all files and directories but EXCLUDE the 'data' folder and installers.
:: Robocopy is perfect for this. It overwrites updated code but leaves your saved data intact.
robocopy "%~dp0." "%EXT_DIR%" /E /XC /XN /XO /XD "data" ".git" "dev_scripts" /XF "INSTALL MAC.command" "INSTALL WINDOWS.bat" >nul 2>&1

echo       Done!
echo.
echo =====================================================
echo  INSTALLATION COMPLETE! 
echo =====================================================
echo Please restart After Effects if it's open.
echo You can launch the plugin via: Window ^> Extensions ^> Motionreis Master
echo.
pause
