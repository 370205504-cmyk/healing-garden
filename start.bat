@echo off
chcp 65001 >nul
title 自动治愈花园
echo ========================================
echo   自动治愈花园 - 部署管理
echo ========================================
echo.
echo 请选择操作:
echo.
echo  [1] 启动 Canvas2D 游戏（浏览器打开）
echo  [2] 启动游戏服务器
echo  [3] 查看项目文档
echo  [4] 打开 GitHub 仓库
echo.
set /p choice="请输入数字 (1-4): "

if "%choice%"=="1" (
    start "" "index.html"
    echo ✅ Canvas2D 游戏已启动
) else if "%choice%"=="2" (
    cd server
    start cmd /k "node app.js"
    echo ✅ 服务器启动中...
) else if "%choice%"=="3" (
    if exist "README.md" (
        start notepad "README.md"
    ) else (
        echo ❌ README.md 不存在
    )
) else if "%choice%"=="4" (
    start "" "https://github.com/370205504-cmyk/healing-garden"
    echo ✅ GitHub 仓库已打开
) else (
    echo ❌ 无效选择
)

echo.
pause
