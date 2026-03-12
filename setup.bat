@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion

echo ================================================
echo   AI Avatar 小程序 - 云函数部署辅助脚本
echo ================================================
echo.

:: 切换到脚本所在目录（项目根目录）
cd /d "%~dp0"

:: -----------------------------------------------
:: 1. 安装根目录工具依赖（sharp 等）
:: -----------------------------------------------
echo [1/4] 安装根目录工具依赖...
call npm install --no-audit --no-fund
if %errorlevel% neq 0 (
    echo [错误] 根目录 npm install 失败，请检查 Node.js 是否已安装
    pause
    exit /b 1
)
echo [OK] 根目录依赖安装完成
echo.

:: -----------------------------------------------
:: 2. 生成 Tabbar PNG 图标
:: -----------------------------------------------
echo [2/4] 生成 Tabbar PNG 图标...
call node miniprogram\images\tabbar\convertSvgToPng.js
if %errorlevel% neq 0 (
    echo [警告] Tabbar PNG 生成失败。若 sharp 尚未编译，可忽略。
) else (
    echo [OK] Tabbar PNG 图标生成完成
)
echo.

:: -----------------------------------------------
:: 3. 安装所有云函数依赖
:: -----------------------------------------------
echo [3/4] 安装所有云函数依赖...
set CLOUD_DIR=cloudfunctions
for /d %%F in (%CLOUD_DIR%\*) do (
    if exist "%%F\package.json" (
        echo   -> 安装 %%~nxF 依赖...
        cd "%%F"
        call npm install --no-audit --no-fund --prefer-offline >nul 2>&1
        if !errorlevel! equ 0 (
            echo      [OK] %%~nxF
        ) else (
            echo      [警告] %%~nxF 安装可能未完全成功
        )
        cd /d "%~dp0"
    )
)
echo [OK] 云函数依赖安装完成
echo.

:: -----------------------------------------------
:: 4. 校验云函数调用映射
:: -----------------------------------------------
echo [4/4] 校验前端↔云函数调用映射...
call node scripts\check-cloud-links.js
echo.

echo ================================================
echo   全部任务执行完毕！
echo.
echo   接下来请在微信开发者工具中：
echo   右键每个云函数文件夹
echo   选择"上传并部署：云端安装依赖"
echo.
echo   重点云函数：
echo     - generateAvatar   (AI头像生成)
echo     - generateMaterial (素材批量生成)
echo     - updatePoints     (积分同步)
echo     - getUserInfo      (用户信息)
echo     - toggleAvatarLike (点赞)
echo ================================================
pause
