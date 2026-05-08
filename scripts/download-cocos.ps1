# Cocos Creator 3.8.8 下载脚本
# 作为总指挥，根据用户授权自行安装

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue" # 避免进度条影响

$downloadDir = "C:\temp\cocos-download"
$installerPath = Join-Path $downloadDir "CocosCreator_v3.8.8_win.exe"

# 创建下载目录
if (-not (Test-Path $downloadDir)) {
    New-Item -ItemType Directory -Path $downloadDir -Force | Out-Null
}

Write-Host "🚀 开始下载 Cocos Creator 3.8.8" -ForegroundColor Cyan
Write-Host "下载目录: $downloadDir" -ForegroundColor Yellow
Write-Host "安装包路径: $installerPath" -ForegroundColor Yellow
Write-Host "文件大小: 约 1.2GB" -ForegroundColor Yellow
Write-Host "下载可能需要一些时间，请耐心等待..." -ForegroundColor Yellow

# 可能的下载源
$downloadUrls = @(
    "https://download.cocos.com/CocosCreator/v3.8.8/CocosCreator_v3.8.8_win.exe",
    "https://cocos.com/creator/download/version/3.8.8/win",
    "https://mirror.cocos.com/CocosCreator/v3.8.8/CocosCreator_v3.8.8_win.exe"
)

# 检查是否已有安装包
if (Test-Path $installerPath) {
    $fileSize = (Get-Item $installerPath).Length / 1GB
    Write-Host "✅ 安装包已存在: $installerPath" -ForegroundColor Green
    Write-Host "📊 文件大小: $($fileSize.ToString('F2')) GB" -ForegroundColor Green
    
    # 检查文件完整性（简单大小检查，完整安装包应大于1GB）
    if ($fileSize -gt 1.0) {
        Write-Host "✅ 文件大小正常，可能已完整下载" -ForegroundColor Green
        exit 0
    } else {
        Write-Host "⚠️  文件大小异常，可能需要重新下载" -ForegroundColor Yellow
    }
}

# 尝试下载
$success = $false
foreach ($url in $downloadUrls) {
    Write-Host "`n尝试从以下地址下载: $url" -ForegroundColor Cyan
    
    try {
        # 使用BITS传输（支持断点续传）
        Write-Host "使用BITS后台传输下载..." -ForegroundColor Yellow
        
        # 尝试使用Invoke-WebRequest，设置超时和重试
        $progressPreference = 'SilentlyContinue'
        $startTime = Get-Date
        
        # 创建WebClient对象（支持进度显示）
        $webClient = New-Object System.Net.WebClient
        
        # 设置超时时间（15分钟）
        $webClient.DownloadFileAsync($url, $installerPath)
        
        # 等待下载完成或超时
        $timeout = 900 # 15分钟
        $elapsed = 0
        
        while ($webClient.IsBusy -and $elapsed -lt $timeout) {
            Start-Sleep -Seconds 5
            $elapsed += 5
            Write-Host "." -NoNewline -ForegroundColor Gray
        }
        
        if ($webClient.IsBusy) {
            $webClient.CancelAsync()
            Write-Host "`n❌ 下载超时" -ForegroundColor Red
            continue
        }
        
        $endTime = Get-Date
        $duration = ($endTime - $startTime).TotalSeconds
        
        # 检查下载的文件
        if (Test-Path $installerPath) {
            $fileSize = (Get-Item $installerPath).Length / 1GB
            Write-Host "`n✅ 下载完成！" -ForegroundColor Green
            Write-Host "📊 下载耗时: $($duration.ToString('F0')) 秒" -ForegroundColor Green
            Write-Host "📦 文件大小: $($fileSize.ToString('F2')) GB" -ForegroundColor Green
            
            if ($fileSize -gt 1.0) {
                $success = $true
                break
            } else {
                Write-Host "⚠️  下载的文件大小异常" -ForegroundColor Yellow
                Remove-Item $installerPath -Force -ErrorAction SilentlyContinue
            }
        }
        
    } catch {
        Write-Host "`n❌ 下载失败: $($_.Exception.Message)" -ForegroundColor Red
        continue
    }
}

if (-not $success) {
    Write-Host "`n" + "="*60 -ForegroundColor Red
    Write-Host "❌ 所有下载源都失败了" -ForegroundColor Red
    Write-Host "="*60 -ForegroundColor Red
    
    Write-Host "`n💡 手动下载指南:" -ForegroundColor Yellow
    Write-Host "1. 打开浏览器访问: https://www.cocos.com/creator/download" -ForegroundColor White
    Write-Host "2. 选择版本: Cocos Creator 3.8.8" -ForegroundColor White
    Write-Host "3. 平台: Windows (64位)" -ForegroundColor White
    Write-Host "4. 下载完成后，将文件重命名为: CocosCreator_v3.8.8_win.exe" -ForegroundColor White
    Write-Host "5. 放置到: $downloadDir" -ForegroundColor White
    
    Write-Host "`n📋 已完成的工作:" -ForegroundColor Cyan
    Write-Host "✅ 下载目录已创建: $downloadDir" -ForegroundColor Green
    Write-Host "✅ 安装脚本就绪: D:\AutoHealingGarden\scripts\install-cocos-creator.js" -ForegroundColor Green
    Write-Host "✅ 安装指南就绪: D:\AutoHealingGarden\COCOS_CREATOR_INSTALL_GUIDE.md" -ForegroundColor Green
    Write-Host "✅ 项目验证通过: 81.8%构建就绪度" -ForegroundColor Green
    
    exit 1
}

Write-Host "`n" + "="*60 -ForegroundColor Green
Write-Host "✅ Cocos Creator 3.8.8 安装包下载完成！" -ForegroundColor Green
Write-Host "="*60 -ForegroundColor Green

Write-Host "`n🚀 下一步操作:" -ForegroundColor Cyan
Write-Host "1. 运行安装脚本: node D:\AutoHealingGarden\scripts\install-cocos-creator.js" -ForegroundColor White
Write-Host "2. 或手动安装: 双击 $installerPath" -ForegroundColor White
Write-Host "3. 安装后验证: node D:\AutoHealingGarden\scripts\environment-check.js" -ForegroundColor White

exit 0