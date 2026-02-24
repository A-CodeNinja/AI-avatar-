@echo off
cd /d "%~dp0"
echo 正在推送代码到 GitHub...
git push origin main
echo.
echo 推送完成!
pause
