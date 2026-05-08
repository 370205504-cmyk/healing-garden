#!/usr/bin/env node

/**
 * 《自动治愈花园》预览诊断工具
 * 诊断无法预览的问题并提供解决方案
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const http = require('http');
const url = require('url');

class PreviewDiagnostic {
    constructor() {
        this.projectRoot = path.resolve(__dirname);
        this.gameDir = path.join(this.projectRoot, 'game');
        this.distDir = path.join(this.projectRoot, 'dist');
        this.buildDir = path.join(this.projectRoot, 'build');
        
        this.issues = [];
        this.solutions = [];
        
        this.colors = {
            reset: '\x1b[0m',
            red: '\x1b[31m',
            green: '\x1b[32m',
            yellow: '\x1b[33m',
            blue: '\x1b[34m',
            magenta: '\x1b[35m',
            cyan: '\x1b[36m',
            white: '\x1b[37m'
        };
    }
    
    log(message, color = 'reset') {
        console.log(`${this.colors[color]}${message}${this.colors.reset}`);
    }
    
    addIssue(issue, severity = 'warning') {
        this.issues.push({ issue, severity });
        this.log(`❌ ${issue}`, severity === 'error' ? 'red' : 'yellow');
    }
    
    addSolution(solution) {
        this.solutions.push(solution);
        this.log(`💡 ${solution}`, 'cyan');
    }
    
    async runDiagnostic() {
        this.log('\n🔍 《自动治愈花园》预览问题诊断', 'magenta');
        this.log('='.repeat(60), 'magenta');
        
        // 1. 检查项目完整性
        await this.checkProjectIntegrity();
        
        // 2. 检查构建产物
        await this.checkBuildOutputs();
        
        // 3. 检查Cocos Creator
        await this.checkCocosCreator();
        
        // 4. 检查Web预览
        await this.checkWebPreview();
        
        // 5. 生成诊断报告
        this.generateReport();
        
        // 6. 提供解决方案
        this.provideSolutions();
    }
    
    async checkProjectIntegrity() {
        this.log('\n📁 检查项目完整性...', 'blue');
        
        const requiredPaths = [
            { path: this.gameDir, name: 'game/ (Cocos项目)' },
            { path: path.join(this.gameDir, 'assets'), name: 'game/assets/' },
            { path: path.join(this.gameDir, 'scenes', 'MainScene.fire'), name: 'MainScene场景文件' },
            { path: path.join(this.gameDir, 'assets', 'scripts'), name: 'game/assets/scripts/' },
            { path: this.distDir, name: 'dist/ (构建输出)' }
        ];
        
        for (const item of requiredPaths) {
            if (fs.existsSync(item.path)) {
                this.log(`✅ ${item.name} 存在`, 'green');
            } else {
                this.addIssue(`${item.name} 缺失或路径错误`, 'error');
            }
        }
        
        // 检查核心脚本
        const coreScripts = [
            'GameManager.ts',
            'PlantingSystem.ts', 
            'GardenSystem.ts',
            'EconomySystem.ts',
            'UIManager.ts',
            'MainScene.ts'
        ];
        
        let missingScripts = [];
        for (const script of coreScripts) {
            const scriptPath = path.join(this.gameDir, 'assets', 'scripts', script);
            if (!fs.existsSync(scriptPath)) {
                missingScripts.push(script);
            }
        }
        
        if (missingScripts.length > 0) {
            this.addIssue(`核心脚本缺失: ${missingScripts.join(', ')}`, 'error');
        } else {
            this.log(`✅ 所有核心脚本存在`, 'green');
        }
    }
    
    async checkBuildOutputs() {
        this.log('\n🏗️ 检查构建产物...', 'blue');
        
        const platforms = ['web', 'wechat', 'douyin'];
        let hasBuilds = false;
        
        for (const platform of platforms) {
            const platformDir = path.join(this.distDir, platform);
            if (fs.existsSync(platformDir)) {
                const files = fs.readdirSync(platformDir);
                if (files.length > 0) {
                    this.log(`✅ ${platform} 平台: ${files.length}个文件`, 'green');
                    hasBuilds = true;
                    
                    // 检查关键文件
                    const keyFiles = {
                        'web': ['index.html', 'main.js'],
                        'wechat': ['game.js', 'game.json', 'project.config.json'],
                        'douyin': ['game.js', 'game.json']
                    };
                    
                    if (keyFiles[platform]) {
                        const missing = keyFiles[platform].filter(file => !files.includes(file));
                        if (missing.length > 0) {
                            this.addIssue(`${platform}平台缺少关键文件: ${missing.join(', ')}`, 'warning');
                        }
                    }
                } else {
                    this.addIssue(`${platform}平台目录为空`, 'warning');
                }
            } else {
                this.addIssue(`${platform}平台目录不存在`, 'warning');
            }
        }
        
        if (!hasBuilds) {
            this.addIssue('没有找到任何构建产物，项目可能需要重新构建', 'error');
        }
    }
    
    async checkCocosCreator() {
        this.log('\n🎮 检查Cocos Creator环境...', 'blue');
        
        const possiblePaths = [
            'D:\\CocosCreator-3.8.8',
            'C:\\Program Files\\CocosCreator',
            'C:\\Program Files (x86)\\CocosCreator',
            path.join(process.env.LOCALAPPDATA || '', 'CocosCreator'),
            path.join(process.env.APPDATA || '', 'CocosCreator')
        ];
        
        let found = false;
        for (const ccPath of possiblePaths) {
            if (fs.existsSync(ccPath)) {
                // 查找可执行文件
                const exePatterns = ['CocosCreator.exe', 'CocosDashboard.exe'];
                for (const pattern of exePatterns) {
                    try {
                        const files = fs.readdirSync(ccPath);
                        const exeFile = files.find(f => f.toLowerCase().includes(pattern.toLowerCase().replace('.exe', '')));
                        if (exeFile) {
                            this.log(`✅ 找到Cocos Creator: ${path.join(ccPath, exeFile)}`, 'green');
                            found = true;
                            break;
                        }
                    } catch (e) {
                        // 忽略错误
                    }
                }
                if (found) break;
            }
        }
        
        if (!found) {
            this.addIssue('未检测到Cocos Creator安装，无法编辑和预览Cocos项目', 'warning');
            this.addSolution('请安装Cocos Creator 3.8.8，或使用提供的安装指南: D:\\AutoHealingGarden\\COCOS_CREATOR_INSTALL_GUIDE.md');
        } else {
            this.addSolution('使用Cocos Dashboard打开项目: D:\\AutoHealingGarden\\game');
            this.addSolution('在Cocos Creator中点击"预览"按钮运行MainScene场景');
        }
    }
    
    async checkWebPreview() {
        this.log('\n🌐 检查Web预览...', 'blue');
        
        const webDir = path.join(this.distDir, 'web');
        if (!fs.existsSync(webDir)) {
            this.addIssue('Web预览目录不存在', 'error');
            return;
        }
        
        const indexHtml = path.join(webDir, 'index.html');
        if (!fs.existsSync(indexHtml)) {
            this.addIssue('Web预览缺少index.html文件', 'error');
            return;
        }
        
        // 检查index.html内容
        try {
            const content = fs.readFileSync(indexHtml, 'utf8');
            if (content.includes('自动治愈花园')) {
                this.log('✅ Web预览页面存在且内容正确', 'green');
            } else {
                this.addIssue('Web预览页面内容异常', 'warning');
            }
        } catch (e) {
            this.addIssue(`无法读取Web预览文件: ${e.message}`, 'error');
        }
        
        // 测试HTTP服务器
        this.addSolution('启动本地HTTP服务器预览: node preview-server.js');
    }
    
    generateReport() {
        this.log('\n📊 诊断报告', 'magenta');
        this.log('='.repeat(60), 'magenta');
        
        const errorCount = this.issues.filter(i => i.severity === 'error').length;
        const warningCount = this.issues.filter(i => i.severity === 'warning').length;
        
        this.log(`问题统计: ${errorCount}个错误, ${warningCount}个警告`, 
                 errorCount > 0 ? 'red' : warningCount > 0 ? 'yellow' : 'green');
        
        if (this.issues.length > 0) {
            this.log('\n📋 发现的问题:', 'yellow');
            this.issues.forEach((issue, i) => {
                const icon = issue.severity === 'error' ? '❌' : '⚠️';
                this.log(`${icon} [${issue.severity.toUpperCase()}] ${issue.issue}`, 
                        issue.severity === 'error' ? 'red' : 'yellow');
            });
        } else {
            this.log('🎉 未发现问题! 项目结构完整。', 'green');
        }
    }
    
    provideSolutions() {
        this.log('\n🚀 解决方案', 'magenta');
        this.log('='.repeat(60), 'magenta');
        
        if (this.solutions.length === 0) {
            this.log('暂无解决方案，请根据上述问题修复项目。', 'yellow');
            return;
        }
        
        this.solutions.forEach((solution, i) => {
            this.log(`${i + 1}. ${solution}`, 'cyan');
        });
        
        // 根据问题推荐最佳方案
        const hasCocosIssue = this.issues.some(i => i.issue.includes('Cocos Creator'));
        const hasBuildIssue = this.issues.some(i => i.issue.includes('构建产物'));
        
        this.log('\n🎯 推荐操作:', 'green');
        
        if (hasCocosIssue) {
            this.log('1. 使用Web预览方案（无需Cocos Creator）', 'green');
            this.log('2. 按照指南安装Cocos Creator进行完整预览', 'green');
        } else if (hasBuildIssue) {
            this.log('1. 运行构建脚本: node scripts\\production-build.js', 'green');
            this.log('2. 然后使用Web预览', 'green');
        } else {
            this.log('1. 直接使用Web预览或Cocos Creator预览', 'green');
        }
        
        this.log('\n⚡ 快速开始Web预览:', 'magenta');
        this.log('1. 打开终端并进入项目目录: cd D:\\AutoHealingGarden', 'white');
        this.log('2. 运行: node preview-server.js', 'white');
        this.log('3. 在浏览器中打开: http://localhost:8080', 'white');
    }
}

// 运行诊断
const diagnostic = new PreviewDiagnostic();
diagnostic.runDiagnostic().catch(console.error);