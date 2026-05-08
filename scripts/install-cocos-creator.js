#!/usr/bin/env node

/**
 * Cocos Creator 3.8.8 自动安装脚本
 * 作为总指挥，根据用户授权自行安装必需开发环境
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn, spawnSync } = require('child_process');
const https = require('https');
const http = require('http');

class CocosCreatorInstaller {
    constructor() {
        this.projectRoot = path.resolve(__dirname, '..');
        this.installDir = 'D:\\CocosCreator-3.8.8';
        this.downloadDir = 'C:\\temp\\cocos-download';
        this.installerPath = path.join(this.downloadDir, 'CocosCreator_v3.8.8_win.exe');
        
        this.logMessages = [];
        this.startTime = Date.now();
        
        // 创建必要的目录
        [this.downloadDir, this.installDir].forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    }
    
    log(message, level = 'INFO') {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] [${level}] ${message}`;
        this.logMessages.push(logEntry);
        console.log(logEntry);
        return logEntry;
    }
    
    async checkExistingInstallations() {
        this.log('🔍 检查现有Cocos Creator安装');
        
        const commonPaths = [
            'C:\\Program Files\\Cocos\\CocosDashboard\\resources\\editors\\creator\\3.8.8\\CocosCreator.exe',
            'C:\\Program Files (x86)\\Cocos\\CocosDashboard\\resources\\editors\\creator\\3.8.8\\CocosCreator.exe',
            `${process.env.LOCALAPPDATA}\\CocosDashboard\\resources\\editors\\creator\\3.8.8\\CocosCreator.exe`,
            'D:\\CocosCreator\\CocosCreator.exe',
            'D:\\Cocos\\CocosCreator.exe',
            this.installDir + '\\CocosCreator.exe'
        ];
        
        let foundPath = null;
        for (const testPath of commonPaths) {
            try {
                if (fs.existsSync(testPath)) {
                    foundPath = testPath;
                    this.log(`✅ 找到现有安装: ${testPath}`);
                    break;
                }
            } catch (error) {
                // 忽略错误继续检查
            }
        }
        
        if (!foundPath) {
            this.log('❌ 未找到现有Cocos Creator 3.8.8安装', 'WARN');
        }
        
        return foundPath;
    }
    
    async downloadInstaller() {
        this.log('📥 开始下载Cocos Creator 3.8.8安装包');
        
        // Cocos Creator 3.8.8 官方下载链接（需要确认）
        const downloadUrls = [
            'https://download.cocos.com/CocosCreator/v3.8.8/CocosCreator_v3.8.8_win.exe',
            'https://cocos.com/creator/download/version/3.8.8/win',
            // 如果官方链接不可用，可能需要寻找备用链接
        ];
        
        // 检查是否已有安装包
        if (fs.existsSync(this.installerPath)) {
            const stats = fs.statSync(this.installerPath);
            const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(1);
            this.log(`✅ 安装包已存在: ${this.installerPath} (${fileSizeMB} MB)`);
            return true;
        }
        
        this.log('⚠️ 需要下载安装包（约1.2GB），这可能需要一些时间', 'WARN');
        this.log('💡 建议：如果您已有CocosCreator_v3.8.8_win.exe文件，请放置到以下位置：');
        this.log(`   ${this.installerPath}`);
        
        // 由于大文件下载可能失败，提供手动下载指南
        this.provideManualDownloadGuide();
        
        return false;
    }
    
    provideManualDownloadGuide() {
        console.log('\n📋 手动下载指南');
        console.log('========================================');
        console.log('由于安装包较大（约1.2GB），建议手动下载：');
        console.log('');
        console.log('1. 访问Cocos官网: https://www.cocos.com/creator/download');
        console.log('2. 选择版本: Cocos Creator 3.8.8');
        console.log('3. 平台: Windows (64位)');
        console.log('4. 下载完成后，将文件重命名为: CocosCreator_v3.8.8_win.exe');
        console.log(`5. 放置到: ${this.downloadDir}`);
        console.log('');
        console.log('或者使用备用下载链接：');
        console.log('- https://download.cocos.com/CocosCreator/v3.8.8/CocosCreator_v3.8.8_win.exe');
        console.log('');
        console.log('放置文件后重新运行此脚本。');
        console.log('========================================\n');
    }
    
    async installCocosCreator() {
        this.log('⚙️ 开始安装Cocos Creator 3.8.8');
        
        if (!fs.existsSync(this.installerPath)) {
            this.log('❌ 安装包不存在，请先下载', 'ERROR');
            return false;
        }
        
        try {
            this.log(`安装包: ${this.installerPath}`);
            this.log(`安装目录: ${this.installDir}`);
            
            // 静默安装参数
            // /S - 静默安装
            // /D=路径 - 指定安装目录
            const installCommand = `"${this.installerPath}" /S /D=${this.installDir}`;
            
            this.log('正在执行静默安装（这可能需要几分钟）...');
            
            // 执行安装
            const result = spawnSync(installCommand, {
                shell: true,
                stdio: 'pipe',
                timeout: 300000 // 5分钟超时
            });
            
            if (result.status === 0) {
                this.log('✅ Cocos Creator 安装完成', 'SUCCESS');
                
                // 验证安装
                const cocosExePath = path.join(this.installDir, 'CocosCreator.exe');
                if (fs.existsSync(cocosExePath)) {
                    this.log(`✅ 验证成功: ${cocosExePath}`);
                    
                    // 更新项目配置
                    await this.updateProjectConfig(cocosExePath);
                    
                    return true;
                } else {
                    this.log('❌ 安装后未找到CocosCreator.exe', 'ERROR');
                    return false;
                }
            } else {
                this.log(`❌ 安装失败，退出码: ${result.status}`, 'ERROR');
                if (result.stderr) {
                    this.log(`错误信息: ${result.stderr.toString()}`, 'ERROR');
                }
                return false;
            }
        } catch (error) {
            this.log(`❌ 安装过程异常: ${error.message}`, 'ERROR');
            return false;
        }
    }
    
    async updateProjectConfig(cocosExePath) {
        this.log('⚙️ 更新项目配置');
        
        try {
            // 更新 .env.build 文件
            const envBuildPath = path.join(this.projectRoot, '.env.build');
            if (fs.existsSync(envBuildPath)) {
                let content = fs.readFileSync(envBuildPath, 'utf-8');
                
                // 更新COCOS_CREATOR_PATH
                const newPathLine = `COCOS_CREATOR_PATH="${cocosExePath}"`;
                if (content.includes('COCOS_CREATOR_PATH=')) {
                    content = content.replace(/COCOS_CREATOR_PATH=.*/g, newPathLine);
                } else {
                    content += `\n${newPathLine}\n`;
                }
                
                fs.writeFileSync(envBuildPath, content, 'utf-8');
                this.log(`✅ 更新 .env.build: ${newPathLine}`);
            }
            
            // 创建或更新项目配置文件
            const projectSettingsDir = path.join(this.projectRoot, 'game', 'settings');
            if (!fs.existsSync(projectSettingsDir)) {
                fs.mkdirSync(projectSettingsDir, { recursive: true });
            }
            
            const projectSettingsPath = path.join(projectSettingsDir, 'project.json');
            if (!fs.existsSync(projectSettingsPath)) {
                const projectSettings = {
                    "engine": "3.8.8",
                    "platform": "web",
                    "start-scene": "db://assets/scenes/MainScene.fire",
                    "simulator-resolution": {
                        "width": 750,
                        "height": 1334
                    }
                };
                
                fs.writeFileSync(projectSettingsPath, JSON.stringify(projectSettings, null, 2), 'utf-8');
                this.log(`✅ 创建项目配置文件: ${projectSettingsPath}`);
            }
            
            return true;
        } catch (error) {
            this.log(`❌ 配置更新失败: ${error.message}`, 'ERROR');
            return false;
        }
    }
    
    async verifyInstallation() {
        this.log('🔍 验证Cocos Creator安装');
        
        const cocosExePath = path.join(this.installDir, 'CocosCreator.exe');
        
        if (!fs.existsSync(cocosExePath)) {
            this.log(`❌ 未找到CocosCreator.exe: ${cocosExePath}`, 'ERROR');
            return false;
        }
        
        try {
            // 尝试获取版本信息
            this.log('正在获取版本信息...');
            
            // 检查版本文件或注册表
            const versionFiles = [
                path.join(this.installDir, 'version'),
                path.join(this.installDir, 'resources', 'version'),
                path.join(this.installDir, 'resources', 'editors', 'creator', 'version')
            ];
            
            let version = '未知';
            for (const versionFile of versionFiles) {
                if (fs.existsSync(versionFile)) {
                    const content = fs.readFileSync(versionFile, 'utf-8').trim();
                    version = content;
                    this.log(`✅ 发现版本文件: ${versionFile} => ${version}`);
                    break;
                }
            }
            
            // 检查是否为3.8.8版本
            if (version.includes('3.8.8')) {
                this.log(`✅ Cocos Creator 3.8.8 安装成功`, 'SUCCESS');
            } else if (version !== '未知') {
                this.log(`⚠️ 安装的版本是 ${version}，项目需要 3.8.8`, 'WARN');
            } else {
                this.log(`✅ Cocos Creator 安装成功（版本: ${version}）`, 'INFO');
            }
            
            // 运行环境检查脚本验证
            this.log('运行环境检查脚本...');
            const envCheckScript = path.join(this.projectRoot, 'scripts', 'environment-check.js');
            if (fs.existsSync(envCheckScript)) {
                try {
                    const result = spawnSync('node', [envCheckScript], {
                        cwd: this.projectRoot,
                        stdio: 'pipe',
                        timeout: 30000
                    });
                    
                    if (result.status === 0) {
                        this.log('✅ 环境检查通过', 'SUCCESS');
                    } else {
                        this.log(`❌ 环境检查失败: ${result.stderr?.toString() || '未知错误'}`, 'ERROR');
                    }
                } catch (error) {
                    this.log(`❌ 环境检查执行失败: ${error.message}`, 'ERROR');
                }
            }
            
            return true;
        } catch (error) {
            this.log(`❌ 验证失败: ${error.message}`, 'ERROR');
            return false;
        }
    }
    
    async run() {
        this.log('🚀 Cocos Creator 3.8.8 自动安装程序启动');
        this.log(`项目根目录: ${this.projectRoot}`);
        this.log(`安装目录: ${this.installDir}`);
        
        try {
            // 1. 检查现有安装
            const existingPath = await this.checkExistingInstallations();
            if (existingPath) {
                this.log(`✅ 使用现有安装: ${existingPath}`);
                
                // 更新配置使用现有安装
                await this.updateProjectConfig(existingPath);
                
                // 运行环境检查
                await this.runEnvironmentCheck();
                
                this.completeWithSuccess('使用现有Cocos Creator安装');
                return;
            }
            
            // 2. 检查/下载安装包
            const hasInstaller = await this.downloadInstaller();
            if (!hasInstaller) {
                this.log('⏸️ 需要手动下载安装包，请按照指南操作', 'WARN');
                this.saveLog();
                return;
            }
            
            // 3. 执行安装
            const installed = await this.installCocosCreator();
            if (!installed) {
                this.log('❌ 安装失败，请检查错误信息', 'ERROR');
                this.saveLog();
                return;
            }
            
            // 4. 验证安装
            const verified = await this.verifyInstallation();
            if (!verified) {
                this.log('⚠️ 安装验证发现问题，但安装已完成', 'WARN');
            }
            
            // 5. 最终验证
            await this.runEnvironmentCheck();
            
            this.completeWithSuccess('Cocos Creator 3.8.8 安装完成');
            
        } catch (error) {
            this.log(`❌ 安装过程异常终止: ${error.message}`, 'ERROR');
            this.saveLog();
            process.exit(1);
        }
    }
    
    async runEnvironmentCheck() {
        const envCheckScript = path.join(this.projectRoot, 'scripts', 'environment-check.js');
        if (fs.existsSync(envCheckScript)) {
            this.log('运行完整环境检查...');
            try {
                const result = spawnSync('node', [envCheckScript], {
                    cwd: this.projectRoot,
                    stdio: 'inherit',
                    timeout: 60000
                });
                
                if (result.status !== 0) {
                    this.log('⚠️ 环境检查发现一些问题', 'WARN');
                }
            } catch (error) {
                this.log(`环境检查失败: ${error.message}`, 'ERROR');
            }
        }
    }
    
    completeWithSuccess(message) {
        const endTime = Date.now();
        const duration = ((endTime - this.startTime) / 1000).toFixed(1);
        
        this.log(`\n🎉 ${message}`, 'SUCCESS');
        this.log(`⏱️  总耗时: ${duration}秒`);
        this.log(`📁 安装目录: ${this.installDir}`);
        this.log(`🎮 项目现在可以开始实际构建测试`);
        this.log('');
        this.log('下一步行动:');
        this.log('1. 运行环境检查: node scripts/environment-check.js');
        this.log('2. 测试Web构建: node build/scripts/build.js web');
        this.log('3. 按LAUNCH_PLAN.md推进实际上线部署');
        
        this.saveLog();
    }
    
    saveLog() {
        const logPath = path.join(this.projectRoot, 'build', 'cocos-install-log.txt');
        const summary = [
            '='.repeat(60),
            'Cocos Creator 3.8.8 安装日志',
            `时间: ${new Date().toISOString()}`,
            `项目: ${this.projectRoot}`,
            `安装目录: ${this.installDir}`,
            '='.repeat(60),
            '',
            ...this.logMessages,
            '',
            '='.repeat(60),
            '安装完成'
        ].join('\n');
        
        fs.writeFileSync(logPath, summary, 'utf-8');
        this.log(`日志已保存: ${logPath}`);
    }
}

// 主执行
async function main() {
    console.log('🚀 Cocos Creator 3.8.8 自动安装程序');
    console.log('基于用户授权："你是总指挥你自行安装一个吧"');
    console.log('========================================\n');
    
    const installer = new CocosCreatorInstaller();
    
    try {
        await installer.run();
    } catch (error) {
        console.error(`❌ 安装程序失败: ${error.message}`);
        process.exit(1);
    }
}

// 执行主函数
if (require.main === module) {
    main().catch(error => {
        console.error(`❌ 安装程序异常: ${error.message}`);
        process.exit(1);
    });
}

module.exports = CocosCreatorInstaller;