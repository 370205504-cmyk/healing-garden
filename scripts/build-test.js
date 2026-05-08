#!/usr/bin/env node

/**
 * 构建测试脚本
 * 模拟构建流程，验证构建配置和环境准备情况
 * 为实际构建做准备
 */

const fs = require('fs');
const path = require('path');

class BuildTester {
    constructor() {
        this.projectRoot = path.resolve(__dirname, '..');
        this.envPath = path.join(this.projectRoot, '.env.build');
        this.buildDir = path.join(this.projectRoot, 'build');
        this.gameDir = path.join(this.projectRoot, 'game');
        this.distDir = path.join(this.projectRoot, 'dist');
        
        this.testResults = [];
        this.startTime = Date.now();
    }
    
    log(message, level = 'INFO') {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] [${level}] ${message}`;
        console.log(logEntry);
        return logEntry;
    }
    
    async runTests() {
        console.log('🚀 开始构建流程测试');
        console.log('========================================');
        console.log(`项目: 自动治愈花园`);
        console.log(`时间: ${new Date().toLocaleString('zh-CN')}`);
        console.log('========================================\n');
        
        // 执行测试套件
        await this.testEnvironmentConfiguration();
        await this.testProjectStructure();
        await this.testBuildConfiguration();
        await this.testBuildScripts();
        await this.testDeploymentReadiness();
        
        // 生成测试报告
        await this.generateTestReport();
        
        return this.allTestsPassed();
    }
    
    async testEnvironmentConfiguration() {
        this.log('🔧 测试环境配置');
        
        const tests = [
            {
                name: '环境配置文件存在',
                test: () => fs.existsSync(this.envPath),
                error: '环境配置文件不存在 (.env.build)',
            },
            {
                name: '环境配置文件可读',
                test: () => {
                    try {
                        const content = fs.readFileSync(this.envPath, 'utf-8');
                        return content.length > 0;
                    } catch {
                        return false;
                    }
                },
                error: '环境配置文件无法读取',
            },
            {
                name: '包含必要环境变量',
                test: () => {
                    const content = fs.readFileSync(this.envPath, 'utf-8');
                    const requiredVars = [
                        'COCOS_CREATOR_PATH',
                        'BUILD_OUTPUT_DIR',
                        'NODE_ENV',
                        'BUILD_PLATFORM',
                    ];
                    return requiredVars.every(varName => content.includes(varName));
                },
                error: '环境文件缺少必要变量',
            },
            {
                name: '构建输出目录可写',
                test: () => {
                    if (!fs.existsSync(this.distDir)) {
                        fs.mkdirSync(this.distDir, { recursive: true });
                    }
                    const testFile = path.join(this.distDir, '.write_test');
                    try {
                        fs.writeFileSync(testFile, 'test');
                        fs.unlinkSync(testFile);
                        return true;
                    } catch {
                        return false;
                    }
                },
                error: '构建输出目录不可写',
            },
        ];
        
        const results = [];
        for (const test of tests) {
            try {
                const passed = test.test();
                results.push({
                    name: test.name,
                    passed,
                    error: passed ? undefined : test.error,
                });
                
                const symbol = passed ? '✅' : '❌';
                this.log(`  ${symbol} ${test.name}`);
                if (!passed) {
                    this.log(`    错误: ${test.error}`, 'WARN');
                }
            } catch (error) {
                results.push({
                    name: test.name,
                    passed: false,
                    error: `测试异常: ${error.message}`,
                });
                this.log(`  ❌ ${test.name}: 测试异常`, 'ERROR');
            }
        }
        
        this.testResults.push({
            category: '环境配置',
            tests: results,
            passed: results.every(r => r.passed),
        });
        
        console.log('');
    }
    
    async testProjectStructure() {
        this.log('🏗️ 测试项目结构');
        
        const requiredPaths = [
            { path: 'game/assets/scripts', type: 'directory', name: '游戏脚本目录' },
            { path: 'game/scenes', type: 'directory', name: '场景目录' },
            { path: 'game/assets/scripts/platforms', type: 'directory', name: '平台适配目录' },
            { path: 'server', type: 'directory', name: '服务端目录' },
            { path: 'tests', type: 'directory', name: '测试目录' },
            { path: 'build', type: 'directory', name: '构建目录' },
            { path: 'build/config', type: 'directory', name: '构建配置目录' },
            { path: 'build/scripts', type: 'directory', name: '构建脚本目录' },
            { path: 'game/assets/scripts/GameManager.ts', type: 'file', name: 'GameManager脚本' },
            { path: 'game/scenes/MainScene.fire', type: 'file', name: '主场景文件' },
            { path: 'build/README.md', type: 'file', name: '构建文档' },
        ];
        
        const results = [];
        for (const item of requiredPaths) {
            const fullPath = path.join(this.projectRoot, item.path);
            let passed = false;
            let error = '';
            
            try {
                if (item.type === 'directory') {
                    passed = fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory();
                    if (!passed) error = `目录不存在: ${item.path}`;
                } else {
                    passed = fs.existsSync(fullPath) && fs.statSync(fullPath).isFile();
                    if (!passed) error = `文件不存在: ${item.path}`;
                }
            } catch (e) {
                error = `检查失败: ${e.message}`;
            }
            
            results.push({
                name: item.name,
                passed,
                error: passed ? undefined : error,
            });
            
            const symbol = passed ? '✅' : '❌';
            this.log(`  ${symbol} ${item.name}`);
            if (!passed) {
                this.log(`    错误: ${error}`, 'WARN');
            }
        }
        
        this.testResults.push({
            category: '项目结构',
            tests: results,
            passed: results.every(r => r.passed),
        });
        
        console.log('');
    }
    
    async testBuildConfiguration() {
        this.log('⚙️ 测试构建配置');
        
        const tests = [
            {
                name: '构建配置文件存在',
                test: () => {
                    const configPath = path.join(this.buildDir, 'config', 'build-config.json');
                    return fs.existsSync(configPath);
                },
                error: '构建配置文件不存在',
            },
            {
                name: '构建配置格式正确',
                test: () => {
                    const configPath = path.join(this.buildDir, 'config', 'build-config.json');
                    try {
                        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
                        return config.version && config.platforms && config.verification;
                    } catch {
                        return false;
                    }
                },
                error: '构建配置格式错误',
            },
            {
                name: '环境变量模板存在',
                test: () => {
                    const templatePath = path.join(this.buildDir, 'config', '.env.build.example');
                    return fs.existsSync(templatePath);
                },
                error: '环境变量模板不存在',
            },
            {
                name: '构建脚本目录完整',
                test: () => {
                    const scriptsDir = path.join(this.buildDir, 'scripts');
                    if (!fs.existsSync(scriptsDir)) return false;
                    
                    const requiredScripts = ['build.js', 'build-all.js'];
                    return requiredScripts.every(script => 
                        fs.existsSync(path.join(scriptsDir, script))
                    );
                },
                error: '构建脚本不完整',
            },
        ];
        
        const results = [];
        for (const test of tests) {
            try {
                const passed = test.test();
                results.push({
                    name: test.name,
                    passed,
                    error: passed ? undefined : test.error,
                });
                
                const symbol = passed ? '✅' : '❌';
                this.log(`  ${symbol} ${test.name}`);
                if (!passed) {
                    this.log(`    错误: ${test.error}`, 'WARN');
                }
            } catch (error) {
                results.push({
                    name: test.name,
                    passed: false,
                    error: `测试异常: ${error.message}`,
                });
                this.log(`  ❌ ${test.name}: 测试异常`, 'ERROR');
            }
        }
        
        this.testResults.push({
            category: '构建配置',
            tests: results,
            passed: results.every(r => r.passed),
        });
        
        console.log('');
    }
    
    async testBuildScripts() {
        this.log('📜 测试构建脚本');
        
        const tests = [
            {
                name: '主构建脚本可执行',
                test: () => {
                    const scriptPath = path.join(this.buildDir, 'scripts', 'build.js');
                    if (!fs.existsSync(scriptPath)) return false;
                    
                    const content = fs.readFileSync(scriptPath, 'utf-8');
                    return content.includes('#!/usr/bin/env node') && content.includes('class BuildRunner');
                },
                error: '主构建脚本格式错误',
            },
            {
                name: '批量构建脚本可执行',
                test: () => {
                    const scriptPath = path.join(this.buildDir, 'scripts', 'build-all.js');
                    if (!fs.existsSync(scriptPath)) return false;
                    
                    const content = fs.readFileSync(scriptPath, 'utf-8');
                    return content.includes('#!/usr/bin/env node') && content.includes('class BatchBuilder');
                },
                error: '批量构建脚本格式错误',
            },
            {
                name: '部署检查脚本可执行',
                test: () => {
                    const scriptPath = path.join(this.buildDir, 'deploy', 'deploy-check.js');
                    if (!fs.existsSync(scriptPath)) return false;
                    
                    const content = fs.readFileSync(scriptPath, 'utf-8');
                    return content.includes('#!/usr/bin/env node') && content.includes('class DeploymentChecker');
                },
                error: '部署检查脚本格式错误',
            },
            {
                name: '构建日志目录可写',
                test: () => {
                    const logsDir = path.join(this.buildDir, 'logs');
                    if (!fs.existsSync(logsDir)) {
                        fs.mkdirSync(logsDir, { recursive: true });
                    }
                    
                    const testFile = path.join(logsDir, '.write_test');
                    try {
                        fs.writeFileSync(testFile, 'test');
                        fs.unlinkSync(testFile);
                        return true;
                    } catch {
                        return false;
                    }
                },
                error: '构建日志目录不可写',
            },
        ];
        
        const results = [];
        for (const test of tests) {
            try {
                const passed = test.test();
                results.push({
                    name: test.name,
                    passed,
                    error: passed ? undefined : test.error,
                });
                
                const symbol = passed ? '✅' : '❌';
                this.log(`  ${symbol} ${test.name}`);
                if (!passed) {
                    this.log(`    错误: ${test.error}`, 'WARN');
                }
            } catch (error) {
                results.push({
                    name: test.name,
                    passed: false,
                    error: `测试异常: ${error.message}`,
                });
                this.log(`  ❌ ${test.name}: 测试异常`, 'ERROR');
            }
        }
        
        this.testResults.push({
            category: '构建脚本',
            tests: results,
            passed: results.every(r => r.passed),
        });
        
        console.log('');
    }
    
    async testDeploymentReadiness() {
        this.log('🚀 测试部署准备');
        
        const tests = [
            {
                name: '平台适配层完整',
                test: () => {
                    const platformsDir = path.join(this.gameDir, 'assets', 'scripts', 'platforms');
                    if (!fs.existsSync(platformsDir)) return false;
                    
                    const requiredAdapters = [
                        'IPlatformAdapter.ts',
                        'PlatformManager.ts',
                        'WebAdapter.ts',
                        'WeChatAdapter.ts',
                        'DouyinAdapter.ts',
                    ];
                    
                    return requiredAdapters.every(adapter =>
                        fs.existsSync(path.join(platformsDir, adapter))
                    );
                },
                error: '平台适配层不完整',
            },
            {
                name: '构建模板完整',
                test: () => {
                    const templatesDir = path.join(this.gameDir, 'build-templates');
                    if (!fs.existsSync(templatesDir)) return false;
                    
                    const requiredTemplates = [
                        'wechatgame/project.config.json',
                        'baidugame/game.json',
                    ];
                    
                    return requiredTemplates.every(template =>
                        fs.existsSync(path.join(templatesDir, template))
                    );
                },
                error: '构建模板不完整',
            },
            {
                name: '验收报告完整',
                test: () => {
                    const requiredReports = [
                        'build-engineer-report.json',
                        'review-report.json',
                        'final-review-report.json',
                    ];
                    
                    return requiredReports.every(report =>
                        fs.existsSync(path.join(this.buildDir, report))
                    );
                },
                error: '验收报告不完整',
            },
            {
                name: '项目总结文档存在',
                test: () => {
                    const summaryPath = path.join(this.projectRoot, 'PROJECT_SUMMARY.md');
                    return fs.existsSync(summaryPath);
                },
                error: '项目总结文档不存在',
            },
        ];
        
        const results = [];
        for (const test of tests) {
            try {
                const passed = test.test();
                results.push({
                    name: test.name,
                    passed,
                    error: passed ? undefined : test.error,
                });
                
                const symbol = passed ? '✅' : '❌';
                this.log(`  ${symbol} ${test.name}`);
                if (!passed) {
                    this.log(`    错误: ${test.error}`, 'WARN');
                }
            } catch (error) {
                results.push({
                    name: test.name,
                    passed: false,
                    error: `测试异常: ${error.message}`,
                });
                this.log(`  ❌ ${test.name}: 测试异常`, 'ERROR');
            }
        }
        
        this.testResults.push({
            category: '部署准备',
            tests: results,
            passed: results.every(r => r.passed),
        });
        
        console.log('');
    }
    
    allTestsPassed() {
        return this.testResults.every(result => result.passed);
    }
    
    async generateTestReport() {
        const endTime = Date.now();
        const duration = ((endTime - this.startTime) / 1000).toFixed(2);
        
        const totalTests = this.testResults.reduce((sum, category) => sum + category.tests.length, 0);
        const passedTests = this.testResults.reduce((sum, category) => 
            sum + category.tests.filter(test => test.passed).length, 0
        );
        const failedTests = totalTests - passedTests;
        
        const report = {
            timestamp: new Date().toISOString(),
            project: "自动治愈花园",
            testType: "构建流程测试",
            durationSeconds: parseFloat(duration),
            summary: {
                totalCategories: this.testResults.length,
                totalTests,
                passedTests,
                failedTests,
                overallPassed: this.allTestsPassed(),
            },
            categories: this.testResults,
            environment: await this.getEnvironmentInfo(),
            recommendations: this.generateRecommendations(),
        };
        
        // 保存JSON报告
        const reportPath = path.join(this.buildDir, 'build-test-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');
        
        // 生成文本报告
        const textReport = this.formatTextReport(report);
        const textReportPath = path.join(this.buildDir, 'build-test-report.txt');
        fs.writeFileSync(textReportPath, textReport, 'utf-8');
        
        // 输出测试结果
        console.log('\n📊 构建测试完成');
        console.log('========================================');
        console.log(`测试类别: ${report.summary.totalCategories}`);
        console.log(`测试总数: ${report.summary.totalTests}`);
        console.log(`通过测试: ${report.summary.passedTests}`);
        console.log(`失败测试: ${report.summary.failedTests}`);
        console.log(`测试用时: ${duration}秒`);
        console.log(`总体结果: ${report.summary.overallPassed ? '✅ 全部通过' : '❌ 有失败项'}`);
        console.log('========================================\n');
        
        console.log('📋 测试报告已生成:');
        console.log(`  JSON报告: ${reportPath}`);
        console.log(`  文本报告: ${textReportPath}`);
        
        return report;
    }
    
    async getEnvironmentInfo() {
        try {
            const envContent = fs.readFileSync(this.envPath, 'utf-8');
            const lines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
            const envVars = {};
            
            lines.forEach(line => {
                const [key, value] = line.split('=').map(s => s.trim());
                if (key && value) {
                    // 隐藏敏感信息的部分内容
                    if (key.includes('APPID') || key.includes('SECRET')) {
                        envVars[key] = value.substring(0, 8) + '***';
                    } else {
                        envVars[key] = value;
                    }
                }
            });
            
            return {
                nodeVersion: process.version,
                platform: process.platform,
                envFileExists: true,
                variables: envVars,
            };
        } catch (error) {
            return {
                nodeVersion: process.version,
                platform: process.platform,
                envFileExists: false,
                error: error.message,
            };
        }
    }
    
    generateRecommendations() {
        const recommendations = [];
        
        if (!this.allTestsPassed()) {
            recommendations.push("立即修复失败的测试项");
            
            for (const category of this.testResults) {
                if (!category.passed) {
                    const failedTests = category.tests.filter(test => !test.passed);
                    for (const test of failedTests) {
                        recommendations.push(`修复 ${category.category}: ${test.name} - ${test.error}`);
                    }
                }
            }
        }
        
        // 通用建议
        recommendations.push("在实际环境中执行完整构建流程");
        recommendations.push("配置真实平台AppID（微信、抖音）");
        recommendations.push("准备部署服务器和环境配置");
        recommendations.push("制定上线后的监控和维护计划");
        
        return recommendations;
    }
    
    formatTextReport(report) {
        let text = `构建流程测试报告
========================================
项目: ${report.project}
测试类型: ${report.testType}
测试时间: ${new Date(report.timestamp).toLocaleString('zh-CN')}
测试用时: ${report.durationSeconds}秒

📊 测试统计
----------------------------------------
测试类别: ${report.summary.totalCategories}
测试总数: ${report.summary.totalTests}
通过测试: ${report.summary.passedTests}
失败测试: ${report.summary.failedTests}
总体结果: ${report.summary.overallPassed ? '✅ 全部通过' : '❌ 有失败项'}

🔍 详细测试结果
----------------------------------------
`;
        
        for (const category of report.categories) {
            const status = category.passed ? '✅ 通过' : '❌ 未通过';
            text += `${category.category}: ${status}\n`;
            
            for (const test of category.tests) {
                const testStatus = test.passed ? '✓' : '✗';
                text += `  ${testStatus} ${test.name}\n`;
                if (!test.passed && test.error) {
                    text += `    错误: ${test.error}\n`;
                }
            }
            text += '\n';
        }
        
        text += `💡 建议与下一步行动
----------------------------------------
${report.recommendations.map(rec => `• ${rec}`).join('\n')}

========================================
报告生成完成
`;
        
        return text;
    }
}

// 执行构建测试
if (require.main === module) {
    const tester = new BuildTester();
    tester.runTests().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error('构建测试执行失败:', error);
        process.exit(1);
    });
}

module.exports = BuildTester;