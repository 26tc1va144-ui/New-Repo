@echo off
title Push ResQFood to GitHub
color 0A
echo ============================================================
echo   Pushing ResQFood to https://github.com/26tc1va144-ui/New-Repo.git
echo ============================================================
echo.
set "PATH=C:\Users\HP\AppData\Local\GitHubDesktop\app-3.6.5\resources\app\git\cmd;%PATH%"
git push -u origin main
echo.
if %ERRORLEVEL% equ 0 (
    echo ============================================================
    echo   SUCCESS! All commits pushed to GitHub successfully!
    echo ============================================================
) else (
    echo ============================================================
    echo   Push failed or cancelled.
    echo ============================================================
)
echo.
pause
