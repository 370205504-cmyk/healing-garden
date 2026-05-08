#!/usr/bin/env node

/**
 * 《自动治愈花园》真实构建脚本
 * 使用真实的Cocos Creator 3.8.8执行构建
 */

const fs = require('fs');
const path = require('path');
const { exec, spawn } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class RealBuildSystem {
    constructor() {
        this.projectRoot = path.resolve(__dirname, '..');
        this.gameDir = path.join(this.projectRoot, 'game');
        this.distDir = path.join(this.projectRoot, 'dist');
        this.cocosPath = 'C:\\ProgramData\\cocos\\editors\\Creator\\3.8.8\\CocosCreator.exe';
        
        this.logFile = path.join(this.projectRoot, 'build', 'real-build-log.json');
        this.startTime = Date.now();
        
        // 颜色输出
        this.colors = {
            reset: '\x1b[0m',
            red: '\x1b[31m',
            green: '\x1b[32m',
            yellow: '\x1b[33m',
            blue: '\x1b[34m',
            magenta: '\x1b[35m',
            cyan: '\x1b[36m'
        };
        
        this.logData = {
            timestamp: new Date().toISOString(),
            builds: [],
            summary: {
                total: 0,
                success: 0,
                failed: 0
            }
        };
    }
    
    log(message, color = 'reset') {
        const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
        console.log(`${this.colors[color]}[${timestamp}] ${message}${this.colors.reset}`);
    }
    
    async verifyEnvironment() {
        this.log('🔍 验证构建环境', 'cyan');
        
        // 检查Cocos Creator
        if (!fs.existsSync(this.cocosPath)) {
            throw new Error(`Cocos Creator未找到: ${this.cocosPath}`);
        }
        this.log(`✅ Cocos Creator: ${this.cocosPath}`, 'green');
        
        // 检查项目目录
        if (!fs.existsSync(this.gameDir)) {
            throw new Error(`游戏项目目录未找到: ${this.gameDir}`);
        }
        this.log(`✅ 游戏项目目录: ${this.gameDir}`, 'green');
        
        // 检查项目配置文件
        const projectJson = path.join(this.gameDir, 'settings/project.json');
        if (!fs.existsSync(projectJson)) {
            throw new Error(`项目配置文件未找到: ${projectJson}`);
        }
        this.log(`✅ 项目配置文件: ${projectJson}`, 'green');
        
        // 检查Cocos Creator版本
        try {
            const { stdout } = await execAsync(`"${this.cocosPath}" --version`);
            this.log(`✅ Cocos Creator版本: ${stdout.trim()}`, 'green');
        } catch (error) {
            this.log(`⚠️ 无法获取Cocos Creator版本: ${error.message}`, 'yellow');
        }
        
        // 创建输出目录
        if (!fs.existsSync(this.distDir)) {
            fs.mkdirSync(this.distDir, { recursive: true });
            this.log(`📁 创建输出目录: ${this.distDir}`, 'blue');
        }
        
        return true;
    }
    
    async buildWeb() {
        return await this.buildPlatform('web', 'web-mobile');
    }
    
    async buildWechat() {
        return await this.buildPlatform('wechat', 'wechatgame');
    }
    
    async buildDouyin() {
        return await this.buildPlatform('douyin', 'bytedance-mini-game');
    }
    
    async buildPlatform(platform, cocosPlatform) {
        this.log(`🚀 开始${platform}平台真实构建`, 'magenta');
        
        const buildRecord = {
            platform: platform,
            startTime: new Date().toISOString(),
            command: '',
            output: '',
            success: false,
            duration: 0,
            outputDir: ''
        };
        
        try {
            // 备份模拟构建产物（如果有）
            await this.backupSimulatedBuild(platform);
            
            // 生成构建命令
            const buildOptions = {
                'web-mobile': 'platform=web-mobile;template=link;md5Cache=false;debug=false',
                'wechatgame': 'platform=wechatgame;template=link;md5Cache=false;debug=false',
                'bytedance-mini-game': 'platform=bytedance-mini-game;template=link;md5Cache=false;debug=false'
            };
            
            const buildConfig = buildOptions[cocosPlatform];
            const buildCommand = `"${this.cocosPath}" --project "${this.gameDir}" --build "${buildConfig}"`;
            
            buildRecord.command = buildCommand;
            this.log(`📝 构建命令: ${buildCommand}`, 'blue');
            
            // 执行构建
            this.log(`⏳ 执行${platform}平台构建，请稍候...`, 'yellow');
            
            const outputDir = path.join(this.distDir, platform);
            buildRecord.outputDir = outputDir;
            
            // 清理旧的构建产物
            if (fs.existsSync(outputDir)) {
                fs.rmSync(outputDir, { recursive: true, force: true });
                this.log(`🧹 清理旧的构建产物: ${outputDir}`, 'blue');
            }
            
            // 执行构建命令
            const startTime = Date.now();
            const result = await this.executeBuildCommand(buildCommand, platform);
            const duration = Date.now() - startTime;
            
            buildRecord.duration = duration;
            buildRecord.output = result.output;
            
            if (result.success) {
                this.log(`✅ ${platform}平台构建成功 (耗时: ${duration}ms)`, 'green');
                buildRecord.success = true;
                
                // 验证构建产物
                const verified = await this.verifyRealBuildOutput(platform);
                if (verified) {
                    this.log(`✅ ${platform}构建产物验证通过`, 'green');
                } else {
                    this.log(`⚠️ ${platform}构建产物验证警告`, 'yellow');
                }
                
                // 记录构建详情
                await this.recordBuildDetails(platform, outputDir);
                
            } else {
                this.log(`❌ ${platform}平台构建失败: ${result.error}`, 'red');
                buildRecord.success = false;
                buildRecord.error = result.error;
            }
            
        } catch (error) {
            this.log(`❌ ${platform}平台构建异常: ${error.message}`, 'red');
            buildRecord.success = false;
            buildRecord.error = error.message;
        }
        
        // 保存构建记录
        this.logData.builds.push(buildRecord);
        this.logData.summary.total++;
        if (buildRecord.success) {
            this.logData.summary.success++;
        } else {
            this.logData.summary.failed++;
        }
        
        await this.saveLogData();
        
        return buildRecord.success;
    }
    
    async executeBuildCommand(command, platform) {
        return new Promise((resolve, reject) => {
            this.log(`⚙️ 正在执行${platform}构建...`, 'cyan');
            
            const childProcess = spawn(command, [], {
                shell: true,
                stdio: ['pipe', 'pipe', 'pipe']
            });
            
            let output = '';
            let errorOutput = '';
            
            childProcess.stdout.on('data', (data) => {
                const text = data.toString();
                output += text;
                
                // 实时输出构建日志
                if (text.includes('Building') || text.includes('Success') || text.includes('Error')) {
                    this.log(`   ${text.trim()}`, 'cyan');
                }
            });
            
            childProcess.stderr.on('data', (data) => {
                const text = data.toString();
                errorOutput += text;
                
                if (text.includes('Error') || text.includes('error') || text.includes('Failed')) {
                    this.log(`   ⚠️ ${text.trim()}`, 'yellow');
                }
            });
            
            childProcess.on('close', (code) => {
                if (code === 0) {
                    resolve({
                        success: true,
                        output: output,
                        error: errorOutput
                    });
                } else {
                    resolve({
                        success: false,
                        output: output,
                        error: `构建进程退出码: ${code}\n${errorOutput}`
                    });
                }
            });
            
            childProcess.on('error', (error) => {
                reject(new Error(`构建进程启动失败: ${error.message}`));
            });
            
            // 设置超时（10分钟）
            setTimeout(() => {
                childProcess.kill();
                reject(new Error(`构建超时 (10分钟)`));
            }, 10 * 60 * 1000);
        });
    }
    
    async verifyRealBuildOutput(platform) {
        const outputDir = path.join(this.distDir, platform);
        
        if (!fs.existsSync(outputDir)) {
            this.log(`❌ 构建输出目录不存在: ${outputDir}`, 'red');
            return false;
        }
        
        const files = fs.readdirSync(outputDir);
        this.log(`📁 ${platform}构建产物: ${files.length}个文件`, 'blue');
        
        // 检查关键文件
        const requiredFiles = {
            'web': ['index.html', 'main.js', 'style.css'],
            'wechat': ['game.js', 'game.json', 'project.config.json'],
            'douyin': ['game.js', 'game.json', 'project.config.json']
        };
        
        const required = requiredFiles[platform] || [];
        let missingFiles = [];
        
        for (const file of required) {
            const filePath = path.join(outputDir, file);
            if (!fs.existsSync(filePath)) {
                missingFiles.push(file);
            }
        }
        
        if (missingFiles.length > 0) {
            this.log(`⚠️ 缺少文件: ${missingFiles.join(', ')}`, 'yellow');
            return false;
        }
        
        // 检查文件大小
        let totalSize = 0;
        for (const file of files) {
            const filePath = path.join(outputDir, file);
            const stats = fs.statSync(filePath);
            totalSize += stats.size;
            
            if (stats.size > 0) {
                this.log(`   ${file}: ${(stats.size / 1024).toFixed(2)} KB`, 'blue');
            }
        }
        
        this.log(`📊 构建产物总大小: ${(totalSize / 1024).toFixed(2)} KB`, 'green');
        
        return true;
    }
    
    async backupSimulatedBuild(platform) {
        const simulatedDir = path.join(this.distDir, platform);
        const backupDir = path.join(this.distDir, `backup-${platform}-${Date.now()}`);
        
        if (fs.existsSync(simulatedDir)) {
            // 检查是否是模拟构建（通过检查文件内容）
            const indexFile = path.join(simulatedDir, 'index.html');
            if (fs.existsSync(indexFile)) {
                const content = fs.readFileSync(indexFile, 'utf-8');
                if (content.includes('模拟构建产物') || content.includes('模拟测试')) {
                    fs.renameSync(simulatedDir, backupDir);
                    this.log(`📦 备份模拟构建产物到: ${backupDir}`, 'yellow');
                }
            }
        }
    }
    
    async recordBuildDetails(platform, outputDir) {
        const details = {
            platform: platform,
            outputDir: outputDir,
            files: [],
            totalSize: 0,
            timestamp: new Date().toISOString()
        };
        
        if (fs.existsSync(outputDir)) {
            const files = fs.readdirSync(outputDir, { recursive: true });
            details.files = files;
            
            let totalSize = 0;
            for (const file of files) {
                const filePath = path.join(outputDir, file);
                if (fs.statSync(filePath).isFile()) {
                    totalSize += fs.statSync(filePath).size;
                }
            }
            details.totalSize = totalSize;
        }
        
        // 保存构建详情
        const detailsFile = path.join(this.projectRoot, 'build', `build-details-${platform}.json`);
        fs.writeFileSync(detailsFile, JSON.stringify(details, null, 2), 'utf-8');
        this.log(`📄 构建详情已保存: ${detailsFile}`, 'blue');
    }
    
    async saveLogData() {
        const endTime = Date.now();
        this.logData.duration = endTime - this.startTime;
        this.logData.endTime = new Date().toISOString();
        
        fs.writeFileSync(this.logFile, JSON.stringify(this.logData, null, 2), 'utf-8');
        
        // 同时保存文本日志
        const textLogFile = path.join(this.projectRoot, 'build', 'real-build-log.txt');
        const textLog = this.generateTextLog();
        fs.writeFileSync(textLogFile, textLog, 'utf-8');
    }
    
    generateTextLog() {
        let log = '《自动治愈花园》真实构建日志\n';
        log += '=' * 80 + '\n';
        log += `开始时间: ${this.logData.timestamp}\n`;
        log += `结束时间: ${this.logData.endTime || '进行中'}\n`;
        log += `总耗时: ${((this.logData.duration || 0) / 1000).toFixed(2)}秒\n\n`;
        
        log += '📊 构建汇总\n';
        log += '-' * 40 + '\n';
        log += `总计构建: ${this.logData.summary.total}\n`;
        log += `成功构建: ${this.logData.summary.success}\n`;
        log += `失败构建: ${this.logData.summary.failed}\n\n`;
        
        log += '🔍 详细构建记录\n';
        log += '-' * 40 + '\n';
        
        for (const build of this.logData.builds) {
            const status = build.success ? '✅' : '❌';
            log += `${status} ${build.platform} 平台\n`;
            log += `   开始时间: ${build.startTime}\n`;
            log += `   耗时: ${build.duration}ms\n`;
            log += `   输出目录: ${build.outputDir}\n`;
            log += `   状态: ${build.success ? '成功' : '失败'}\n`;
            
            if (build.error) {
                log += `   错误: ${build.error.substring(0, 200)}...\n`;
            }
            log += '\n';
        }
        
        return log;
    }
    
    async runAll() {
        this.log('🏗️ 《自动治愈花园》真实构建系统启动', 'magenta');
        this.log('=' * 80, 'magenta');
        
        try {
            // 验证环境
            await this.verifyEnvironment();
            
            // 执行多平台构建
            const results = {
                web: await this.buildWeb(),
                wechat: await this.buildWechat(),
                douyin: await this.buildDouyin()
            };
            
            // 显示最终结果
            this.displayFinalResults(results);
            
        } catch (error) {
            this.log(`❌ 构建系统异常终止: ${error.message}`, 'red');
            await this.saveLogData();
            process.exit(1);
        }
    }
    
    displayFinalResults(results) {
        this.log('\n' + '=' * 80, 'magenta');
        this.log('🎯 真实构建完成', 'magenta');
        this.log('=' * 80, 'magenta');
        
        const total = Object.keys(results).length;
        const success = Object.values(results).filter(r => r).length;
        const successRate = (success / total * 100).toFixed(1);
        
        this.log(`构建平台: ${total}个`, 'blue');
        this.log(`成功构建: ${success}个 ✅`, 'green');
        this.log(`失败构建: ${total - success}个 ❌`, 'red');
        this.log(`成功率: ${successRate}%`, successRate >= 80 ? 'green' : successRate >= 60 ? 'yellow' : 'red');
        
        this.log('\n📁 构建产物位置:', 'cyan');
        this.log(`  D:\\AutoHealingGarden\\dist\\`, 'cyan');
        
        this.log('\n📄 构建日志位置:', 'cyan');
        this.log(`  D:\\AutoHealingGarden\\build\\real-build-log.json`, 'cyan');
        this.log(`  D:\\AutoHealingGarden\\build\\real-build-log.txt`, 'cyan');
        
        // 构建建议
        this.log('\n📋 构建建议:', 'yellow');
        if (success === total) {
            this.log('✅ 所有平台构建成功，可以开始真实部署', 'green');
        } else if (success >= 2) {
            this.log('⚠️ 部分平台构建成功，可选择性部署', 'yellow');
        } else if (success >= 1) {
            this.log('⚠️ 仅一个平台构建成功，建议修复后再部署', 'yellow');
        } else {
            this.log('❌ 所有平台构建失败，需要修复构建问题', 'red');
        }
        
        this.log('\n🚀 下一步:', 'magenta');
        if (success > 0) {
            this.log('1. 使用真实构建产物进行部署测试', 'blue');
            this.log('2. 启动服务器并验证API', 'blue');
            this.log('3. 按照D-day执行检查清单进行部署', 'blue');
            this.log('4. 开始灰度发布流程', 'blue');
        } else {
            this.log('1. 检查Cocos Creator构建配置', 'blue');
            this.log('2. 修复构建错误', 'blue');
            this.log('3. 重新执行真实构建', 'blue');
        }
    }
}

// 命令行接口
const realBuild = new RealBuildSystem();

// 确保在退出时保存日志
process.on('SIGINT', async () => {
    await realBuild.saveLogData();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    await realBuild.saveLogData();
    process.exit(0);
});

// 执行真实构建
realBuild.runAll().then(() => {
    process.exit(0);
}).catch(error => {
    console.error('真实构建失败:', error);
    process.exit(1);
});