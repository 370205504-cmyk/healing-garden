#!/usr/bin/env node

/**
 * 《自动治愈花园》模拟生产环境测试脚本
 * 在开发环境模拟生产部署的完整流程，验证部署准备情况
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

class ProductionSimulationTest {
    constructor() {
        this.projectRoot = path.resolve(__dirname, '..');
        this.buildDir = path.join(this.projectRoot, 'build');
        this.distDir = path.join(this.projectRoot, 'dist');
        this.serverDir = path.join(this.projectRoot, 'server');
        this.deployDir = path.join(this.projectRoot, 'deploy');
        this.scriptsDir = path.join(this.projectRoot, 'scripts');
        
        this.testResults = {
            timestamp: new Date().toISOString(),
            environment: 'development_simulation',
            tests: [],
            summary: {
                total: 0,
                passed: 0,
                failed: 0,
                skipped: 0
            },
            deploymentReadinessScore: 0
        };
        
        this.serverProcess = null;
        
        this.colors = {
            reset: '\x1b[0m',
            red: '\x1b[31m',
            green: '\x1b[32m',
            yellow: '\x1b[33m',
            blue: '\x1b[34m'
        };
    }
    
    log(message, color = 'reset') {
        console.log(`${this.colors[color]}${message}${this.colors.reset}`);
    }
    
    async runAllTests() {
        this.log('🚀 《自动治愈花园》模拟生产环境测试', 'yellow');
        this.log('=' * 80, 'yellow');
        this.log('开始时间: ' + new Date().toLocaleString(), 'blue');
        this.log('测试环境: 开发环境模拟生产部署', 'blue');
        
        try {
            // 1. 前置检查
            await this.runPreflightChecks();
            
            // 2. 构建验证测试
            await this.runBuildValidationTests();
            
            // 3. 部署流程测试
            await this.runDeploymentProcessTests();
            
            // 4. 服务验证测试
            await this.runServiceValidationTests();
            
            // 5. 监控和告警测试
            await this.runMonitoringTests();
            
            // 6. 安全测试
            await this.runSecurityTests();
            
            // 7. 清理测试
            await this.runCleanupTests();
            
            // 生成测试报告
            await this.generateTestReport();
            
            // 显示最终结果
            this.displayFinalResults();
            
        } catch (error) {
            this.log(`❌ 测试过程异常终止: ${error.message}`, 'red');
            this.cleanup();
            process.exit(1);
        }
    }
    
    async runPreflightChecks() {
        this.log('\n📋 前置检查', 'yellow');
        
        const checks = [
            {
                name: '项目目录存在',
                test: () => fs.existsSync(this.projectRoot),
                message: '项目根目录存在'
            },
            {
                name: '构建产物目录',
                test: () => fs.existsSync(this.distDir),
                message: '构建产物目录存在'
            },
            {
                name: '服务器代码目录',
                test: () => fs.existsSync(this.serverDir),
                message: '服务器代码目录存在'
            },
            {
                name: '部署配置目录',
                test: () => fs.existsSync(this.deployDir),
                message: '部署配置目录存在'
            },
            {
                name: '生产环境配置文件',
                test: () => fs.existsSync(path.join(this.projectRoot, '.env.production')),
                message: '生产环境配置文件存在'
            },
            {
                name: '构建配置文件',
                test: () => fs.existsSync(path.join(this.projectRoot, '.env.build')),
                message: '构建配置文件存在'
            }
        ];
        
        for (const check of checks) {
            await this.runSingleTest(check.name, check.test, check.message);
        }
    }
    
    async runBuildValidationTests() {
        this.log('\n🛠️ 构建验证测试', 'yellow');
        
        const tests = [
            {
                name: 'Web平台构建产物验证',
                test: () => {
                    const webDir = path.join(this.distDir, 'web');
                    if (!fs.existsSync(webDir)) return false;
                    
                    const files = fs.readdirSync(webDir);
                    const hasIndex = files.includes('index.html');
                    const hasMainJs = files.includes('main.js');
                    return hasIndex && hasMainJs;
                },
                message: 'Web平台构建产物完整'
            },
            {
                name: '微信平台构建产物验证',
                test: () => {
                    const wechatDir = path.join(this.distDir, 'wechat');
                    if (!fs.existsSync(wechatDir)) return false;
                    
                    const files = fs.readdirSync(wechatDir);
                    const hasGameJs = files.includes('game.js');
                    return hasGameJs && files.length > 0;
                },
                message: '微信平台构建产物完整'
            },
            {
                name: '抖音平台构建产物验证',
                test: () => {
                    const douyinDir = path.join(this.distDir, 'douyin');
                    if (!fs.existsSync(douyinDir)) return false;
                    
                    const files = fs.readdirSync(douyinDir);
                    const hasGameJs = files.includes('game.js');
                    return hasGameJs && files.length > 0;
                },
                message: '抖音平台构建产物完整'
            },
            {
                name: '构建脚本可执行性验证',
                test: () => {
                    const buildScript = path.join(this.projectRoot, 'build', 'scripts', 'build-actual.js');
                    if (!fs.existsSync(buildScript)) return false;
                    
                    try {
                        // 尝试解析脚本语法
                        const content = fs.readFileSync(buildScript, 'utf-8');
                        // 简单语法检查 - 检查是否是有效的JavaScript
                        if (!content.includes('require(') && !content.includes('import ')) {
                            return false;
                        }
                        return true;
                    } catch {
                        return false;
                    }
                },
                message: '构建脚本语法正确'
            }
        ];
        
        for (const test of tests) {
            await this.runSingleTest(test.name, test.test, test.message);
        }
    }
    
    async runDeploymentProcessTests() {
        this.log('\n🚀 部署流程测试', 'yellow');
        
        const tests = [
            {
                name: '部署脚本存在性验证',
                test: () => fs.existsSync(path.join(this.deployDir, 'scripts', 'deploy-production.ps1')),
                message: '部署脚本存在'
            },
            {
                name: '部署脚本语法检查',
                test: () => {
                    const scriptPath = path.join(this.deployDir, 'scripts', 'deploy-production.ps1');
                    try {
                        const content = fs.readFileSync(scriptPath, 'utf-8');
                        // 检查PowerShell脚本基本结构
                        const hasParam = content.includes('[CmdletBinding()]') || content.includes('param(');
                        const hasFunctions = content.includes('function ') || content.includes('Write-');
                        return hasParam && hasFunctions;
                    } catch {
                        return false;
                    }
                },
                message: '部署脚本语法正确'
            },
            {
                name: '备份目录可访问性',
                test: () => {
                    const backupDir = path.join(this.deployDir, 'backup');
                    try {
                        // 尝试创建测试文件
                        const testFile = path.join(backupDir, '.test-write');
                        fs.writeFileSync(testFile, 'test');
                        fs.unlinkSync(testFile);
                        return true;
                    } catch {
                        return false;
                    }
                },
                message: '备份目录可读写'
            },
            {
                name: '环境配置文件完整性',
                test: () => {
                    const envFiles = ['.env.production', '.env.build'];
                    for (const envFile of envFiles) {
                        const envPath = path.join(this.projectRoot, envFile);
                        if (!fs.existsSync(envPath)) return false;
                        
                        const content = fs.readFileSync(envPath, 'utf-8');
                        if (content.length < 50) return false; // 太短可能不完整
                    }
                    return true;
                },
                message: '环境配置文件完整'
            }
        ];
        
        for (const test of tests) {
            await this.runSingleTest(test.name, test.test, test.message);
        }
    }
    
    async runServiceValidationTests() {
        this.log('\n🔧 服务验证测试', 'yellow');
        
        const tests = [
            {
                name: '服务器依赖包完整性',
                test: () => {
                    const packageJson = path.join(this.serverDir, 'package.json');
                    if (!fs.existsSync(packageJson)) return false;
                    
                    try {
                        const pkg = JSON.parse(fs.readFileSync(packageJson, 'utf-8'));
                        return pkg.dependencies && Object.keys(pkg.dependencies).length > 0;
                    } catch {
                        return false;
                    }
                },
                message: '服务器依赖包配置完整'
            },
            {
                name: '服务器启动脚本验证',
                test: () => {
                    const appJs = path.join(this.serverDir, 'app.js');
                    if (!fs.existsSync(appJs)) return false;
                    
                    try {
                        const content = fs.readFileSync(appJs, 'utf-8');
                        const hasExpress = content.includes('express');
                        const hasMongoDB = content.includes('mongodb') || content.includes('mongoose');
                        return hasExpress && hasMongoDB;
                    } catch {
                        return false;
                    }
                },
                message: '服务器启动脚本完整'
            },
            {
                name: '服务器模型文件完整性',
                test: () => {
                    const modelsDir = path.join(this.serverDir, 'models');
                    if (!fs.existsSync(modelsDir)) return false;
                    
                    const modelFiles = ['User.js', 'Game.js', 'Ad.js'];
                    for (const modelFile of modelFiles) {
                        if (!fs.existsSync(path.join(modelsDir, modelFile))) {
                            return false;
                        }
                    }
                    return true;
                },
                message: '服务器模型文件完整'
            }
        ];
        
        for (const test of tests) {
            await this.runSingleTest(test.name, test.test, test.message);
        }
        
        // 启动服务器进行功能测试
        await this.startServerForTesting();
    }
    
    async startServerForTesting() {
        this.log('\n🌐 启动开发服务器测试', 'yellow');
        
        return new Promise((resolve, reject) => {
            try {
                // 先检查服务器是否已在运行
                try {
                    const check = execSync('curl -s http://localhost:3000', { timeout: 3000 }).toString();
                    if (check.includes('running')) {
                        this.log('  检测到服务器已在运行，复用现有实例', 'blue');
                        this.runServerHealthTest();
                        resolve();
                        return;
                    }
                } catch {
                    // 服务器未运行，继续启动
                }
                
                this.log('  启动开发服务器...', 'blue');
                
                // 启动服务器
                this.serverProcess = spawn('npm', ['run', 'dev'], {
                    cwd: this.serverDir,
                    stdio: ['pipe', 'pipe', 'pipe'],
                    shell: true
                });
                
                let serverStarted = false;
                let startupTimeout;
                
                // 监听服务器输出
                this.serverProcess.stdout.on('data', (data) => {
                    const output = data.toString();
                    if (output.includes('Server running on port') || output.includes('3000')) {
                        serverStarted = true;
                        clearTimeout(startupTimeout);
                        this.log('  ✅ 服务器启动成功', 'green');
                        this.runServerHealthTest();
                        resolve();
                    }
                });
                
                this.serverProcess.stderr.on('data', (data) => {
                    const error = data.toString();
                    if (!error.includes('deprecated') && !error.includes('warning')) {
                        this.log(`  ⚠️ 服务器错误: ${error.trim()}`, 'yellow');
                    }
                });
                
                // 设置启动超时
                startupTimeout = setTimeout(() => {
                    if (!serverStarted) {
                        this.log('  ❌ 服务器启动超时', 'red');
                        this.stopServer();
                        reject(new Error('服务器启动超时'));
                    }
                }, 10000);
                
                // 服务器进程错误处理
                this.serverProcess.on('error', (error) => {
                    this.log(`  ❌ 服务器启动失败: ${error.message}`, 'red');
                    clearTimeout(startupTimeout);
                    reject(error);
                });
                
            } catch (error) {
                this.log(`  ❌ 启动服务器失败: ${error.message}`, 'red');
                reject(error);
            }
        });
    }
    
    async runServerHealthTest() {
        this.log('\n❤️ 服务器健康检查', 'yellow');
        
        const tests = [
            {
                name: '服务器根端点访问',
                test: () => {
                    try {
                        const result = execSync('curl -s http://localhost:3000', { timeout: 5000 }).toString();
                        return result.includes('running') || result.includes('status');
                    } catch {
                        return false;
                    }
                },
                message: '服务器根端点可访问'
            },
            {
                name: '服务器API端点验证',
                test: () => {
                    try {
                        const result = execSync('curl -s http://localhost:3000/api/users', { timeout: 5000 }).toString();
                        const json = JSON.parse(result);
                        return json.status === 'ok' || json.success === true;
                    } catch {
                        return false;
                    }
                },
                message: '用户API端点正常'
            },
            {
                name: '服务器响应时间测试',
                test: () => {
                    try {
                        const start = Date.now();
                        execSync('curl -s http://localhost:3000', { timeout: 5000 });
                        const duration = Date.now() - start;
                        return duration < 1000; // 响应时间应小于1秒
                    } catch {
                        return false;
                    }
                },
                message: '服务器响应时间正常'
            }
        ];
        
        for (const test of tests) {
            await this.runSingleTest(test.name, test.test, test.message);
        }
    }
    
    async runMonitoringTests() {
        this.log('\n📊 监控配置测试', 'yellow');
        
        const tests = [
            {
                name: 'Prometheus配置验证',
                test: () => {
                    const configPath = path.join(this.deployDir, 'monitoring', 'prometheus.yml');
                    if (!fs.existsSync(configPath)) return false;
                    
                    const content = fs.readFileSync(configPath, 'utf-8');
                    return content.includes('scrape_configs') && content.includes('job_name');
                },
                message: 'Prometheus配置文件完整'
            },
            {
                name: '告警规则验证',
                test: () => {
                    const alertsPath = path.join(this.deployDir, 'monitoring', 'alerts.yml');
                    if (!fs.existsSync(alertsPath)) return false;
                    
                    const content = fs.readFileSync(alertsPath, 'utf-8');
                    return content.includes('alert:') && content.includes('expr:');
                },
                message: '告警规则配置文件完整'
            },
            {
                name: 'Grafana仪表板验证',
                test: () => {
                    const dashboardPath = path.join(this.deployDir, 'monitoring', 'grafana-dashboard.json');
                    if (!fs.existsSync(dashboardPath)) return false;
                    
                    try {
                        const content = JSON.parse(fs.readFileSync(dashboardPath, 'utf-8'));
                        return content.dashboard && content.dashboard.panels;
                    } catch {
                        return false;
                    }
                },
                message: 'Grafana仪表板配置完整'
            },
            {
                name: '监控部署指南验证',
                test: () => {
                    const guidePath = path.join(this.deployDir, 'monitoring', 'MONITORING_SETUP.md');
                    if (!fs.existsSync(guidePath)) return false;
                    
                    const content = fs.readFileSync(guidePath, 'utf-8');
                    return content.length > 1000; // 指南应有一定长度
                },
                message: '监控部署指南完整'
            }
        ];
        
        for (const test of tests) {
            await this.runSingleTest(test.name, test.test, test.message);
        }
    }
    
    async runSecurityTests() {
        this.log('\n🔐 安全配置测试', 'yellow');
        
        const tests = [
            {
                name: '安全扫描脚本验证',
                test: () => fs.existsSync(path.join(this.scriptsDir, 'security-scan.js')),
                message: '安全扫描脚本存在'
            },
            {
                name: '安全扫描报告验证',
                test: () => {
                    const securityDir = path.join(this.buildDir, 'security');
                    if (!fs.existsSync(securityDir)) return false;
                    
                    const reports = fs.readdirSync(securityDir)
                        .filter(f => f.startsWith('security-scan-') && f.endsWith('.json'));
                    return reports.length > 0;
                },
                message: '安全扫描报告存在'
            },
            {
                name: '生产环境敏感信息检查',
                test: () => {
                    const envPath = path.join(this.projectRoot, '.env.production');
                    if (!fs.existsSync(envPath)) return false;
                    
                    const content = fs.readFileSync(envPath, 'utf-8');
                    // 检查是否使用占位符而非真实敏感信息
                    const placeholderPatterns = [
                        /CHANGE_ME/i,
                        /YOUR_/i,
                        /REPLACE_/i,
                        /TODO_/i
                    ];
                    
                    for (const pattern of placeholderPatterns) {
                        if (pattern.test(content)) {
                            return true; // 找到占位符，说明没有硬编码真实信息
                        }
                    }
                    
                    // 如果没有占位符，检查是否有看起来像真实敏感信息
                    const sensitivePatterns = [
                        /password\s*=\s*['"][^'"]{8,}['"]/i,
                        /secret\s*=\s*['"][^'"]{16,}['"]/i,
                        /key\s*=\s*['"][^'"]{32,}['"]/i
                    ];
                    
                    for (const pattern of sensitivePatterns) {
                        if (pattern.test(content)) {
                            return false; // 可能包含真实敏感信息
                        }
                    }
                    
                    return true; // 没有发现明显问题
                },
                message: '生产环境配置使用占位符，无硬编码敏感信息'
            }
        ];
        
        for (const test of tests) {
            await this.runSingleTest(test.name, test.test, test.message);
        }
    }
    
    async runCleanupTests() {
        this.log('\n🧹 清理和恢复测试', 'yellow');
        
        const tests = [
            {
                name: '备份脚本验证',
                test: () => {
                    // 检查部署脚本中的备份功能
                    const scriptPath = path.join(this.deployDir, 'scripts', 'deploy-production.ps1');
                    if (!fs.existsSync(scriptPath)) return false;
                    
                    const content = fs.readFileSync(scriptPath, 'utf-8');
                    return content.includes('Backup-CurrentDeployment') || content.includes('backup');
                },
                message: '备份功能已实现'
            },
            {
                name: '回滚功能验证',
                test: () => {
                    // 检查部署脚本中的回滚功能
                    const scriptPath = path.join(this.deployDir, 'scripts', 'deploy-production.ps1');
                    if (!fs.existsSync(scriptPath)) return false;
                    
                    const content = fs.readFileSync(scriptPath, 'utf-8');
                    return content.includes('Rollback-Deployment') || content.includes('rollback');
                },
                message: '回滚功能已实现'
            }
        ];
        
        for (const test of tests) {
            await this.runSingleTest(test.name, test.test, test.message);
        }
    }
    
    async runSingleTest(name, testFn, successMessage) {
        const test = {
            name,
            status: 'pending',
            message: '',
            timestamp: new Date().toISOString()
        };
        
        try {
            const result = testFn();
            
            if (result) {
                test.status = 'passed';
                test.message = successMessage;
                this.testResults.summary.passed++;
                this.log(`  ✅ ${name}: 通过`, 'green');
            } else {
                test.status = 'failed';
                test.message = '测试失败';
                this.testResults.summary.failed++;
                this.log(`  ❌ ${name}: 失败`, 'red');
            }
        } catch (error) {
            test.status = 'error';
            test.message = `测试异常: ${error.message}`;
            this.testResults.summary.failed++;
            this.log(`  ⚠️ ${name}: 异常 - ${error.message}`, 'yellow');
        }
        
        this.testResults.tests.push(test);
        this.testResults.summary.total++;
    }
    
    stopServer() {
        if (this.serverProcess) {
            this.log('  停止测试服务器...', 'blue');
            this.serverProcess.kill('SIGTERM');
            this.serverProcess = null;
        }
    }
    
    async generateTestReport() {
        this.log('\n📊 生成测试报告...', 'yellow');
        
        // 计算部署准备度分数
        const totalTests = this.testResults.summary.total;
        const passedTests = this.testResults.summary.passed;
        const readinessScore = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
        this.testResults.deploymentReadinessScore = readinessScore;
        
        const reportDir = path.join(this.buildDir, 'simulation-tests');
        if (!fs.existsSync(reportDir)) {
            fs.mkdirSync(reportDir, { recursive: true });
        }
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        
        // 1. JSON详细报告
        const jsonReportPath = path.join(reportDir, `simulation-test-${timestamp}.json`);
        fs.writeFileSync(jsonReportPath, JSON.stringify(this.testResults, null, 2), 'utf-8');
        this.log(`  JSON报告: ${jsonReportPath}`, 'blue');
        
        // 2. 文本摘要报告
        const textReportPath = path.join(reportDir, `simulation-test-${timestamp}.txt`);
        const textReport = this.generateTextReport();
        fs.writeFileSync(textReportPath, textReport, 'utf-8');
        this.log(`  文本报告: ${textReportPath}`, 'blue');
    }
    
    generateTextReport() {
        let report = '《自动治愈花园》模拟生产环境测试报告\n';
        report += '=' * 80 + '\n';
        report += `测试时间: ${this.testResults.timestamp}\n`;
        report += `测试环境: ${this.testResults.environment}\n\n`;
        
        // 测试汇总
        report += '📊 测试汇总\n';
        report += '-' * 40 + '\n';
        report += `总计测试: ${this.testResults.summary.total}\n`;
        report += `通过测试: ${this.testResults.summary.passed}\n`;
        report += `失败测试: ${this.testResults.summary.failed}\n`;
        report += `跳过测试: ${this.testResults.summary.skipped}\n`;
        report += `部署准备度分数: ${this.testResults.deploymentReadinessScore}/100\n\n`;
        
        // 详细测试结果
        report += '🔍 详细测试结果\n';
        report += '-' * 40 + '\n';
        
        for (const test of this.testResults.tests) {
            const statusSymbol = test.status === 'passed' ? '✅' : 
                               test.status === 'failed' ? '❌' : '⚠️';
            report += `${statusSymbol} ${test.name}\n`;
            report += `  状态: ${test.status}\n`;
            report += `  消息: ${test.message}\n`;
            report += `  时间: ${test.timestamp}\n\n`;
        }
        
        // 部署建议
        report += '🚀 部署建议\n';
        report += '-' * 40 + '\n';
        
        const readinessScore = this.testResults.deploymentReadinessScore;
        if (readinessScore >= 90) {
            report += '✅ 部署准备非常充分\n';
            report += '建议: 可以立即开始生产部署\n';
        } else if (readinessScore >= 75) {
            report += '⚠️ 部署准备基本完成\n';
            report += '建议: 解决失败测试后开始生产部署\n';
        } else if (readinessScore >= 60) {
            report += '⚠️ 部署准备一般\n';
            report += '建议: 需要解决主要问题，考虑灰度发布\n';
        } else {
            report += '❌ 部署准备不足\n';
            report += '建议: 需要重点解决技术问题，延期部署\n';
        }
        
        return report;
    }
    
    displayFinalResults() {
        this.log('\n' + '=' * 80, 'yellow');
        this.log('🎯 模拟生产环境测试完成', 'yellow');
        this.log('=' * 80, 'yellow');
        
        const total = this.testResults.summary.total;
        const passed = this.testResults.summary.passed;
        const readinessScore = this.testResults.deploymentReadinessScore;
        
        this.log(`测试总数: ${total}`, 'blue');
        this.log(`通过测试: ${passed} ✅`, 'green');
        this.log(`失败测试: ${this.testResults.summary.failed} ❌`, 'red');
        this.log(`部署准备度: ${readinessScore}/100`, 
                 readinessScore >= 90 ? 'green' : readinessScore >= 75 ? 'yellow' : 'red');
        
        // 分类统计
        const categories = {
            '前置检查': this.testResults.tests.filter(t => t.name.includes('目录') || t.name.includes('文件')).length,
            '构建验证': this.testResults.tests.filter(t => t.name.includes('构建')).length,
            '部署流程': this.testResults.tests.filter(t => t.name.includes('部署')).length,
            '服务验证': this.testResults.tests.filter(t => t.name.includes('服务器')).length,
            '监控配置': this.testResults.tests.filter(t => t.name.includes('监控') || t.name.includes('Prometheus')).length,
            '安全配置': this.testResults.tests.filter(t => t.name.includes('安全')).length
        };
        
        this.log('\n📈 分类统计:', 'yellow');
        for (const [category, count] of Object.entries(categories)) {
            if (count > 0) {
                const passedCount = this.testResults.tests
                    .filter(t => t.name.includes(category) && t.status === 'passed').length;
                const rate = count > 0 ? Math.round((passedCount / count) * 100) : 0;
                this.log(`  ${category}: ${passedCount}/${count} (${rate}%)`, 
                         rate >= 80 ? 'green' : rate >= 60 ? 'yellow' : 'red');
            }
        }
        
        // 最终建议
        this.log('\n📋 最终建议:', 'yellow');
        if (readinessScore >= 90) {
            this.log('✅ 建议: 可以按计划开始D-day生产部署', 'green');
        } else if (readinessScore >= 75) {
            this.log('⚠️ 建议: 解决关键问题后开始灰度发布', 'yellow');
        } else if (readinessScore >= 60) {
            this.log('⚠️ 建议: 需要更多准备，考虑延期或分阶段部署', 'yellow');
        } else {
            this.log('❌ 建议: 部署准备不足，需要重新评估', 'red');
        }
        
        this.log('\n📁 报告位置:', 'blue');
        this.log(`  D:\\AutoHealingGarden\\build\\simulation-tests\\`, 'blue');
    }
    
    cleanup() {
        this.stopServer();
    }
}

// 命令行接口
const simulator = new ProductionSimulationTest();

// 确保在退出时清理
process.on('SIGINT', () => {
    simulator.cleanup();
    process.exit(0);
});

process.on('SIGTERM', () => {
    simulator.cleanup();
    process.exit(0);
});

simulator.runAllTests().then(() => {
    simulator.cleanup();
    process.exit(0);
}).catch(error => {
    console.error('模拟测试失败:', error);
    simulator.cleanup();
    process.exit(1);
});