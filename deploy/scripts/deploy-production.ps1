#!/usr/bin/env pwsh
# 《自动治愈花园》生产部署脚本
# 使用方式: .\deploy-production.ps1 -Environment production -Action deploy

param(
    [ValidateSet('staging', 'production')]
    [string]$Environment = 'production',
    
    [ValidateSet('deploy', 'rollback', 'status', 'monitor')]
    [string]$Action = 'deploy',
    
    [string]$Version = 'latest',
    
    [switch]$Force,
    
    [switch]$DryRun
)

# 配置
$ScriptStartTime = Get-Date
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$DeployRoot = Join-Path $ProjectRoot "deploy"
$BuildRoot = Join-Path $ProjectRoot "build"
$DistRoot = Join-Path $ProjectRoot "dist"
$ServerRoot = Join-Path $ProjectRoot "server"
$LogDir = Join-Path $BuildRoot "logs"
$BackupDir = Join-Path $DeployRoot "backup"

# 颜色定义
$ColorRed = "`e[31m"
$ColorGreen = "`e[32m"
$ColorYellow = "`e[33m"
$ColorBlue = "`e[34m"
$ColorReset = "`e[0m"

function Write-Info {
    param([string]$Message)
    Write-Host "${ColorBlue}[INFO]${ColorReset} $Message"
}

function Write-Success {
    param([string]$Message)
    Write-Host "${ColorGreen}[SUCCESS]${ColorReset} $Message"
}

function Write-Warning {
    param([string]$Message)
    Write-Host "${ColorYellow}[WARNING]${ColorReset} $Message"
}

function Write-Error {
    param([string]$Message)
    Write-Host "${ColorRed}[ERROR]${ColorReset} $Message"
}

function Write-Step {
    param([string]$Step)
    Write-Host ""
    Write-Host "=" * 80
    Write-Host "步骤: $Step"
    Write-Host "=" * 80
    Write-Host ""
}

function Test-Prerequisites {
    Write-Step "检查部署前提条件"
    
    $prerequisites = @{
        "Node.js" = { Get-Command node -ErrorAction SilentlyContinue }
        "npm" = { Get-Command npm -ErrorAction SilentlyContinue }
        "Git" = { Get-Command git -ErrorAction SilentlyContinue }
        "项目目录" = { Test-Path $ProjectRoot }
        "构建产物" = { Test-Path $DistRoot }
        "服务器代码" = { Test-Path $ServerRoot }
    }
    
    $allPassed = $true
    foreach ($prereq in $prerequisites.GetEnumerator()) {
        try {
            $result = & $prereq.Value
            if ($result) {
                Write-Info "$($prereq.Key): ✅ 通过"
            } else {
                Write-Error "$($prereq.Key): ❌ 失败"
                $allPassed = $false
            }
        } catch {
            Write-Error "$($prereq.Key): ❌ 检查失败 - $_"
            $allPassed = $false
        }
    }
    
    if (-not $allPassed) {
        Write-Error "前提条件检查失败，部署中止"
        exit 1
    }
    
    Write-Success "所有前提条件检查通过"
}

function Backup-CurrentDeployment {
    Write-Step "备份当前部署"
    
    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $backupPath = Join-Path $BackupDir "backup-$timestamp"
    
    try {
        # 创建备份目录
        New-Item -ItemType Directory -Path $backupPath -Force | Out-Null
        
        # 备份服务器代码
        if (Test-Path $ServerRoot) {
            $serverBackup = Join-Path $backupPath "server"
            Copy-Item -Path $ServerRoot -Destination $serverBackup -Recurse -Force
            Write-Info "服务器代码备份到: $serverBackup"
        }
        
        # 备份环境配置文件
        $envFiles = @(".env.production", ".env.build", ".env.deploy")
        foreach ($envFile in $envFiles) {
            $envPath = Join-Path $ProjectRoot $envFile
            if (Test-Path $envPath) {
                Copy-Item -Path $envPath -Destination $backupPath -Force
                Write-Info "配置文件 $envFile 已备份"
            }
        }
        
        Write-Success "备份完成: $backupPath"
        return $backupPath
    } catch {
        Write-Error "备份失败: $_"
        return $null
    }
}

function Build-Application {
    Write-Step "构建应用程序"
    
    try {
        Write-Info "切换到项目根目录: $ProjectRoot"
        Push-Location $ProjectRoot
        
        # 检查构建环境
        if (-not (Test-Path ".env.build")) {
            Write-Error "缺少构建环境配置文件 .env.build"
            return $false
        }
        
        # 执行构建测试
        Write-Info "运行构建测试..."
        if ($DryRun) {
            Write-Warning "DryRun模式: 跳过实际构建"
            return $true
        }
        
        # 执行Web平台构建
        Write-Info "构建Web平台..."
        node build/scripts/build-actual.js web
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Web平台构建失败"
            return $false
        }
        
        # 执行微信平台构建
        Write-Info "构建微信平台..."
        node build/scripts/build-actual.js wechat
        if ($LASTEXITCODE -ne 0) {
            Write-Error "微信平台构建失败"
            return $false
        }
        
        # 执行抖音平台构建
        Write-Info "构建抖音平台..."
        node build/scripts/build-actual.js douyin
        if ($LASTEXITCODE -ne 0) {
            Write-Error "抖音平台构建失败"
            return $false
        }
        
        # 验证构建产物
        Write-Info "验证构建产物..."
        $platforms = @("web", "wechat", "douyin")
        foreach ($platform in $platforms) {
            $platformDir = Join-Path $DistRoot $platform
            if (-not (Test-Path $platformDir)) {
                Write-Error "构建产物目录不存在: $platformDir"
                return $false
            }
            
            $fileCount = (Get-ChildItem $platformDir -File).Count
            Write-Info "$platform 平台: $fileCount 个文件"
            
            if ($fileCount -eq 0) {
                Write-Warning "$platform 平台构建产物为空"
            }
        }
        
        Write-Success "所有平台构建完成"
        return $true
    } catch {
        Write-Error "构建过程异常: $_"
        return $false
    } finally {
        Pop-Location
    }
}

function Deploy-Server {
    Write-Step "部署服务器应用"
    
    try {
        Write-Info "准备服务器部署..."
        
        if ($DryRun) {
            Write-Warning "DryRun模式: 跳过服务器部署"
            return $true
        }
        
        # 检查生产环境配置
        $envProduction = Join-Path $ProjectRoot ".env.production"
        if (-not (Test-Path $envProduction)) {
            Write-Error "缺少生产环境配置文件 .env.production"
            return $false
        }
        
        # 复制生产环境配置
        Write-Info "配置生产环境..."
        $serverEnv = Join-Path $ServerRoot ".env"
        if (Test-Path $serverEnv) {
            $backupEnv = "$serverEnv.backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
            Copy-Item -Path $serverEnv -Destination $backupEnv -Force
            Write-Info "备份现有环境文件: $backupEnv"
        }
        
        Copy-Item -Path $envProduction -Destination $serverEnv -Force
        Write-Info "生产环境配置已复制"
        
        # 安装服务器依赖
        Write-Info "安装服务器依赖..."
        Push-Location $ServerRoot
        npm ci --production
        if ($LASTEXITCODE -ne 0) {
            Write-Error "依赖安装失败"
            Pop-Location
            return $false
        }
        Pop-Location
        
        # 创建部署标记文件
        $deployMarker = Join-Path $ServerRoot ".deployed"
        $deployInfo = @{
            timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
            environment = $Environment
            version = $Version
            gitCommit = if (Get-Command git -ErrorAction SilentlyContinue) {
                git rev-parse --short HEAD
            } else { "unknown" }
        } | ConvertTo-Json
        
        $deployInfo | Out-File -FilePath $deployMarker -Encoding UTF8
        Write-Info "部署标记文件已创建"
        
        Write-Success "服务器部署准备完成"
        return $true
    } catch {
        Write-Error "服务器部署失败: $_"
        return $false
    }
}

function Start-Server {
    Write-Step "启动游戏服务器"
    
    try {
        Write-Info "启动服务器..."
        
        if ($DryRun) {
            Write-Warning "DryRun模式: 跳过服务器启动"
            return $true
        }
        
        # 检查服务器是否已在运行
        $nodeProcesses = Get-Process node -ErrorAction SilentlyContinue | Where-Object {
            $_.Path -like "*$ServerRoot*"
        }
        
        if ($nodeProcesses) {
            Write-Warning "发现运行的服务器进程，正在停止..."
            foreach ($process in $nodeProcesses) {
                Stop-Process -Id $process.Id -Force
                Write-Info "已停止进程: $($process.Id)"
            }
            Start-Sleep -Seconds 3
        }
        
        # 启动服务器
        Push-Location $ServerRoot
        Write-Info "启动开发服务器 (nodemon)..."
        
        if ($Force) {
            # 强制模式，直接启动
            $serverJob = Start-Job -ScriptBlock {
                param($ServerRoot)
                cd $ServerRoot
                npm run dev
            } -ArgumentList $ServerRoot
            
            Write-Info "服务器已在后台作业启动，作业ID: $($serverJob.Id)"
        } else {
            # 正常模式，在前台启动
            Write-Warning "正常模式下，服务器将在前台启动"
            Write-Warning "按 Ctrl+C 停止服务器"
            npm run dev
        }
        
        Pop-Location
        
        # 等待服务器启动
        Write-Info "等待服务器启动..."
        Start-Sleep -Seconds 5
        
        # 测试服务器健康状态
        Write-Info "测试服务器健康状态..."
        try {
            $healthResponse = Invoke-RestMethod -Uri "http://localhost:3000" -Method Get -TimeoutSec 10
            Write-Success "服务器健康检查通过"
            Write-Info "服务状态: $($healthResponse.status)"
            Write-Info "可用端点: $($healthResponse.endpoints -join ', ')"
        } catch {
            Write-Warning "服务器健康检查失败: $_"
            Write-Warning "服务器可能仍在启动中，或配置有问题"
        }
        
        Write-Success "服务器启动流程完成"
        return $true
    } catch {
        Write-Error "服务器启动失败: $_"
        return $false
    } finally {
        Pop-Location
    }
}

function Monitor-Deployment {
    Write-Step "监控部署状态"
    
    try {
        Write-Info "部署监控检查..."
        
        # 检查服务器状态
        Write-Info "检查服务器状态..."
        try {
            $response = Invoke-RestMethod -Uri "http://localhost:3000" -Method Get -TimeoutSec 5
            if ($response.status -eq "running") {
                Write-Success "服务器运行正常"
            } else {
                Write-Warning "服务器状态异常: $($response.status)"
            }
        } catch {
            Write-Error "无法连接到服务器: $_"
        }
        
        # 检查构建产物
        Write-Info "检查构建产物..."
        $platforms = @("web", "wechat", "douyin")
        foreach ($platform in $platforms) {
            $platformDir = Join-Path $DistRoot $platform
            if (Test-Path $platformDir) {
                $files = Get-ChildItem $platformDir -File
                Write-Info "$platform 平台: $($files.Count) 个文件"
            } else {
                Write-Warning "$platform 平台: 目录不存在"
            }
        }
        
        # 检查环境配置
        Write-Info "检查环境配置..."
        $requiredEnvFiles = @(".env.production", ".env.build")
        foreach ($envFile in $requiredEnvFiles) {
            $envPath = Join-Path $ProjectRoot $envFile
            if (Test-Path $envPath) {
                Write-Info "$envFile: ✅ 存在"
            } else {
                Write-Warning "$envFile: ❌ 缺失"
            }
        }
        
        # 生成部署报告
        $deployDuration = (Get-Date) - $ScriptStartTime
        Write-Success "部署监控完成"
        Write-Info "部署用时: $($deployDuration.TotalSeconds.ToString('F2')) 秒"
        
        return $true
    } catch {
        Write-Error "部署监控失败: $_"
        return $false
    }
}

function Rollback-Deployment {
    Write-Step "回滚部署"
    
    try {
        Write-Info "查找可用备份..."
        
        $backups = Get-ChildItem $BackupDir -Directory | Sort-Object LastWriteTime -Descending
        if (-not $backups) {
            Write-Error "没有找到可用备份"
            return $false
        }
        
        $latestBackup = $backups[0]
        Write-Info "找到最新备份: $($latestBackup.Name)"
        
        if (-not $Force) {
            $confirmation = Read-Host "确定要回滚到备份 $($latestBackup.Name) 吗？(y/N)"
            if ($confirmation -notmatch '^[Yy]') {
                Write-Info "回滚已取消"
                return $false
            }
        }
        
        if ($DryRun) {
            Write-Warning "DryRun模式: 跳过实际回滚"
            return $true
        }
        
        # 停止当前服务器
        Write-Info "停止当前服务器..."
        $nodeProcesses = Get-Process node -ErrorAction SilentlyContinue | Where-Object {
            $_.Path -like "*$ServerRoot*"
        }
        
        foreach ($process in $nodeProcesses) {
            Stop-Process -Id $process.Id -Force
            Write-Info "已停止进程: $($process.Id)"
        }
        
        # 恢复服务器代码
        Write-Info "恢复服务器代码..."
        $serverBackup = Join-Path $latestBackup.FullName "server"
        if (Test-Path $serverBackup) {
            Remove-Item $ServerRoot -Recurse -Force -ErrorAction SilentlyContinue
            Copy-Item -Path $serverBackup -Destination $ServerRoot -Recurse -Force
            Write-Success "服务器代码已恢复"
        }
        
        # 恢复环境配置
        Write-Info "恢复环境配置..."
        $envFiles = Get-ChildItem $latestBackup.FullName -File -Filter ".env.*"
        foreach ($envFile in $envFiles) {
            $destPath = Join-Path $ProjectRoot $envFile.Name
            Copy-Item -Path $envFile.FullName -Destination $destPath -Force
            Write-Info "恢复配置文件: $($envFile.Name)"
        }
        
        Write-Success "回滚完成: $($latestBackup.Name)"
        return $true
    } catch {
        Write-Error "回滚失败: $_"
        return $false
    }
}

# 主部署流程
function Main {
    Write-Host ""
    Write-Host "🚀 《自动治愈花园》部署系统" -ForegroundColor Cyan
    Write-Host "环境: $Environment" -ForegroundColor Yellow
    Write-Host "操作: $Action" -ForegroundColor Yellow
    Write-Host "版本: $Version" -ForegroundColor Yellow
    Write-Host "开始时间: $ScriptStartTime" -ForegroundColor Gray
    Write-Host ""
    
    # 创建必要目录
    New-Item -ItemType Directory -Path $LogDir -Force | Out-Null
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
    
    # 根据操作类型执行
    switch ($Action) {
        "deploy" {
            # 部署流程
            Test-Prerequisites
            $backupPath = Backup-CurrentDeployment
            if (-not $backupPath) {
                Write-Error "备份失败，部署中止"
                exit 1
            }
            
            if (-not (Build-Application)) {
                Write-Error "构建失败，部署中止"
                exit 1
            }
            
            if (-not (Deploy-Server)) {
                Write-Error "服务器部署失败"
                exit 1
            }
            
            if (-not (Start-Server)) {
                Write-Error "服务器启动失败"
                exit 1
            }
            
            Monitor-Deployment
            
            Write-Success "🎉 部署完成！"
            Write-Info "Web游戏: file://$DistRoot/web/index.html"
            Write-Info "服务器: http://localhost:3000"
            Write-Info "备份位置: $backupPath"
        }
        
        "rollback" {
            # 回滚流程
            if (-not (Rollback-Deployment)) {
                Write-Error "回滚失败"
                exit 1
            }
            
            Start-Server
            Write-Success "✅ 回滚完成"
        }
        
        "status" {
            # 状态检查
            Monitor-Deployment
        }
        
        "monitor" {
            # 监控模式
            Write-Info "进入监控模式，按 Ctrl+C 退出"
            while ($true) {
                Clear-Host
                Monitor-Deployment
                Start-Sleep -Seconds 30
            }
        }
    }
    
    # 输出部署总结
    $deployDuration = (Get-Date) - $ScriptStartTime
    Write-Host ""
    Write-Host "=" * 80
    Write-Host "部署总结" -ForegroundColor Cyan
    Write-Host "操作: $Action" -ForegroundColor Gray
    Write-Host "环境: $Environment" -ForegroundColor Gray
    Write-Host "用时: $($deployDuration.TotalSeconds.ToString('F2')) 秒" -ForegroundColor Gray
    Write-Host "结果: 完成" -ForegroundColor Green
    Write-Host "=" * 80
}

# 异常处理
try {
    Main
} catch {
    Write-Error "部署过程异常: $_"
    Write-Host ""
    Write-Host "部署失败，请检查以上错误信息" -ForegroundColor Red
    exit 1
}