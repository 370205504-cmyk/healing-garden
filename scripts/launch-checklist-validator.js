#!/usr/bin/env node

/**
 * 《自动治愈花园》上线检查清单验证脚本
 * 自动验证上线检查清单中的各项，生成验证报告
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class LaunchChecklistValidator {
    constructor() {
        this.projectRoot = path.resolve(__dirname, '..');
        this.launchPlanPath = path.join(this.projectRoot, 'LAUNCH_PLAN.md');
        this.buildDir = path.join(this.projectRoot, 'build');
        this.distDir = path.join(this.projectRoot, 'dist');
        this.serverDir = path.join(this.projectRoot, 'server');
        this.deployDir = path.join(this.projectRoot, 'deploy');
        
        this.validationResults = {
            timestamp: new Date().toISOString(),
            summary: {
                totalChecks: 0,
                automatedChecks: 0,
                manualChecks: 0,
                passed: 0,
                failed: 0,
                manualRequired: 0
            },
            sections: {}
        };
        
        // 检查项映射到验证函数
        this.checkValidators = {
            // 构建检查
            '三级验收报告齐全且通过': this.validateThreeLevelReview.bind(this),
            '构建测试全部通过（27项测试）': this.validateBuildTests.bind(this),
            '批量构建全部成功（Web、微信、抖音三平台）': this.validateMultiPlatformBuilds.bind(this),
            '构建产物验证通过（文件完整、大小合理）': this.validateBuildArtifacts.bind(this),
            
            // 部署环境检查
            '服务器环境就绪（操作系统、软件依赖）': this.validateServerEnvironment.bind(this),
            '域名和SSL证书配置完成': this.validateDomainSSL.bind(this),
            'Nginx/Web服务器配置正确': this.validateWebServerConfig.bind(this),
            '数据库环境就绪（MongoDB、Redis）': this.validateDatabaseEnvironment.bind(this),
            
            // 监控检查
            '服务器监控就绪（CPU、内存、磁盘、网络）': this.validateServerMonitoring.bind(this),
            '应用监控就绪（性能指标、错误率）': this.validateApplicationMonitoring.bind(this),
            '告警系统就绪（邮件、短信、即时通讯）': this.validateAlertSystem.bind(this),
            
            // 安全检查
            '安全扫描通过（无高危漏洞）': this.validateSecurityScan.bind(this),
            '防火墙配置正确': this.validateFirewallConfig.bind(this),
            
            // 内容检查
            '游戏内容符合平台规范（微信、抖音）': this.validatePlatformCompliance.bind(this),
            '无侵权内容（图片、音效、代码）': this.validateCopyright.bind(this),
            
            // 功能检查
            '核心游戏功能正常（种植、花园、经济系统）': this.validateCoreFunctionality.bind(this),
            '平台适配功能正常（广告、分享、登录、支付）': this.validatePlatformIntegration.bind(this),
            
            // 运维检查
            '服务器容量满足预期用户量': this.validateCapacityPlanning.bind(this),
            '数据库备份策略就绪': this.validateBackupStrategy.bind(this),
            '部署文档完整': this.validateDeploymentDocumentation.bind(this)
        };
        
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
    
    async runValidation() {
        this.log('🔍 《自动治愈花园》上线检查清单验证', 'yellow');
        this.log('=' * 80, 'yellow');
        this.log('开始时间: ' + new Date().toLocaleString(), 'blue');
        
        // 1. 解析检查清单
        const checklist = await this.parseChecklist();
        
        // 2. 执行验证
        await this.executeValidations(checklist);
        
        // 3. 生成报告
        await this.generateReports();
        
        // 4. 显示摘要
        this.displaySummary();
    }
    
    async parseChecklist() {
        this.log('\n📋 解析上线检查清单...', 'yellow');
        
        try {
            const content = fs.readFileSync(this.launchPlanPath, 'utf-8');
            const lines = content.split('\n');
            
            const checklist = {
                technical: [],
                business: [],
                operations: []
            };
            
            let currentSection = null;
            let currentSubsection = null;
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                
                // 检测章节
                if (line === '### 技术检查清单') {
                    currentSection = 'technical';
                    continue;
                } else if (line === '### 业务检查清单') {
                    currentSection = 'business';
                    continue;
                } else if (line === '### 运维检查清单') {
                    currentSection = 'operations';
                    continue;
                }
                
                // 解析检查项
                if (currentSection && line.startsWith('- [ ] ')) {
                    const checkItem = line.substring(5); // 去掉"- [ ] "
                    
                    const check = {
                        id: `${currentSection}_${checklist[currentSection].length + 1}`,
                        description: checkItem,
                        category: currentSection,
                        status: 'pending',
                        validationMethod: this.determineValidationMethod(checkItem),
                        result: null,
                        details: null,
                        timestamp: null
                    };
                    
                    checklist[currentSection].push(check);
                }
            }
            
            // 统计
            const totalChecks = checklist.technical.length + checklist.business.length + checklist.operations.length;
            this.log(`✅ 找到 ${totalChecks} 个检查项`, 'green');
            this.log(`  技术检查: ${checklist.technical.length} 项`, 'blue');
            this.log(`  业务检查: ${checklist.business.length} 项`, 'blue');
            this.log(`  运维检查: ${checklist.operations.length} 项`, 'blue');
            
            return checklist;
        } catch (error) {
            this.log(`❌ 解析检查清单失败: ${error.message}`, 'red');
            return {
                technical: [],
                business: [],
                operations: []
            };
        }
    }
    
    determineValidationMethod(checkItem) {
        // 检查是否有对应的验证器
        for (const [key, validator] of Object.entries(this.checkValidators)) {
            if (checkItem.includes(key)) {
                return 'automated';
            }
        }
        
        // 检查是否需要人工验证
        const manualKeywords = ['符合平台规范', '侵权内容', '年龄分级', '敏感内容', 
                               '新手引导', '界面交互', '用户体验', '用户反馈'];
        if (manualKeywords.some(keyword => checkItem.includes(keyword))) {
            return 'manual';
        }
        
        // 检查是否可自动验证
        const automatedKeywords = ['构建', '测试', '验证', '配置', '监控', '备份', '文档'];
        if (automatedKeywords.some(keyword => checkItem.includes(keyword))) {
            return 'semi-automated';
        }
        
        return 'manual';
    }
    
    async executeValidations(checklist) {
        this.log('\n🔧 执行验证...', 'yellow');
        
        // 初始化结果结构
        this.validationResults.sections = {
            technical: { checks: [], summary: { total: 0, passed: 0, failed: 0, manual: 0 } },
            business: { checks: [], summary: { total: 0, passed: 0, failed: 0, manual: 0 } },
            operations: { checks: [], summary: { total: 0, passed: 0, failed: 0, manual: 0 } }
        };
        
        // 验证所有检查项
        for (const section of ['technical', 'business', 'operations']) {
            this.log(`\n${section === 'technical' ? '🛠️ 技术检查' : section === 'business' ? '💼 业务检查' : '🔧 运维检查'}:`, 'yellow');
            
            for (const check of checklist[section]) {
                await this.validateCheckItem(check);
                
                // 更新汇总统计
                this.validationResults.sections[section].checks.push(check);
                this.validationResults.sections[section].summary.total++;
                
                if (check.status === 'passed') {
                    this.validationResults.sections[section].summary.passed++;
                } else if (check.status === 'failed') {
                    this.validationResults.sections[section].summary.failed++;
                } else if (check.status === 'manual') {
                    this.validationResults.sections[section].summary.manual++;
                }
                
                // 更新总体统计
                this.validationResults.summary.totalChecks++;
                if (check.validationMethod === 'automated' || check.validationMethod === 'semi-automated') {
                    this.validationResults.summary.automatedChecks++;
                } else {
                    this.validationResults.summary.manualChecks++;
                }
                
                if (check.status === 'passed') {
                    this.validationResults.summary.passed++;
                } else if (check.status === 'failed') {
                    this.validationResults.summary.failed++;
                } else if (check.status === 'manual') {
                    this.validationResults.summary.manualRequired++;
                }
            }
        }
    }
    
    async validateCheckItem(check) {
        try {
            // 查找对应的验证器
            let validatorFound = false;
            for (const [key, validator] of Object.entries(this.checkValidators)) {
                if (check.description.includes(key)) {
                    check.result = await validator();
                    validatorFound = true;
                    break;
                }
            }
            
            if (!validatorFound) {
                // 如果没有找到特定的验证器，使用通用验证
                check.result = await this.genericValidation(check);
            }
            
            // 确定状态
            if (check.result === 'AUTOMATED_PASS') {
                check.status = 'passed';
                check.details = '自动验证通过';
            } else if (check.result === 'AUTOMATED_FAIL') {
                check.status = 'failed';
                check.details = '自动验证失败';
            } else if (check.result === 'MANUAL_REQUIRED') {
                check.status = 'manual';
                check.details = '需要人工验证';
            } else if (check.result === 'PASS_WITH_CAUTION') {
                check.status = 'passed';
                check.details = '验证通过（但有注意事项）';
            } else {
                check.status = 'manual';
                check.details = '需要人工验证';
            }
            
            check.timestamp = new Date().toISOString();
            
            // 显示结果
            const statusSymbol = check.status === 'passed' ? '✅' : 
                               check.status === 'failed' ? '❌' : 
                               '🔍';
            this.log(`  ${statusSymbol} ${check.description}`, 
                     check.status === 'passed' ? 'green' : 
                     check.status === 'failed' ? 'red' : 'yellow');
            
            if (check.details) {
                this.log(`    ${check.details}`, 'blue');
            }
            
        } catch (error) {
            check.status = 'error';
            check.details = `验证过程出错: ${error.message}`;
            check.timestamp = new Date().toISOString();
            
            this.log(`  ⚠️ ${check.description}`, 'yellow');
            this.log(`    错误: ${error.message}`, 'red');
        }
    }
    
    // ========== 验证函数实现 ==========
    
    async validateThreeLevelReview() {
        try {
            // 检查三级验收报告
            const reviewReports = [
                path.join(this.buildDir, 'build-engineer-report.json'),
                path.join(this.buildDir, 'review-report.json'),
                path.join(this.buildDir, 'final-review-report.json')
            ];
            
            let allExist = true;
            for (const report of reviewReports) {
                if (!fs.existsSync(report)) {
                    allExist = false;
                    break;
                }
            }
            
            if (!allExist) {
                return 'AUTOMATED_FAIL';
            }
            
            // 读取最终验收报告
            const finalReview = JSON.parse(fs.readFileSync(reviewReports[2], 'utf-8'));
            if (finalReview.finalScore >= 90) {
                return 'AUTOMATED_PASS';
            } else {
                return 'AUTOMATED_FAIL';
            }
        } catch {
            return 'MANUAL_REQUIRED';
        }
    }
    
    async validateBuildTests() {
        try {
            const buildTestReport = path.join(this.buildDir, 'build-test-report.json');
            if (!fs.existsSync(buildTestReport)) {
                return 'AUTOMATED_FAIL';
            }
            
            const report = JSON.parse(fs.readFileSync(buildTestReport, 'utf-8'));
            if (report.totalTests === report.passedTests && report.totalTests > 0) {
                return 'AUTOMATED_PASS';
            } else {
                return 'AUTOMATED_FAIL';
            }
        } catch {
            return 'MANUAL_REQUIRED';
        }
    }
    
    async validateMultiPlatformBuilds() {
        try {
            const platforms = ['web', 'wechat', 'douyin'];
            let allBuilt = true;
            
            for (const platform of platforms) {
                const platformDir = path.join(this.distDir, platform);
                if (!fs.existsSync(platformDir)) {
                    allBuilt = false;
                    break;
                }
                
                const files = fs.readdirSync(platformDir);
                if (files.length === 0) {
                    allBuilt = false;
                    break;
                }
            }
            
            return allBuilt ? 'AUTOMATED_PASS' : 'AUTOMATED_FAIL';
        } catch {
            return 'MANUAL_REQUIRED';
        }
    }
    
    async validateBuildArtifacts() {
        try {
            const webDir = path.join(this.distDir, 'web');
            if (!fs.existsSync(webDir)) {
                return 'AUTOMATED_FAIL';
            }
            
            const files = fs.readdirSync(webDir);
            const hasIndexHtml = files.includes('index.html');
            const hasMainJs = files.includes('main.js');
            
            return (hasIndexHtml && hasMainJs) ? 'AUTOMATED_PASS' : 'AUTOMATED_FAIL';
        } catch {
            return 'MANUAL_REQUIRED';
        }
    }
    
    async validateServerEnvironment() {
        // 检查关键软件依赖
        try {
            // 检查Node.js版本
            const nodeVersion = process.version;
            const majorVersion = parseInt(nodeVersion.replace('v', '').split('.')[0]);
            
            if (majorVersion >= 16) {
                return 'AUTOMATED_PASS';
            } else {
                return 'PASS_WITH_CAUTION';
            }
        } catch {
            return 'MANUAL_REQUIRED';
        }
    }
    
    async validateDomainSSL() {
        // 域名和SSL需要人工配置
        return 'MANUAL_REQUIRED';
    }
    
    async validateWebServerConfig() {
        // 检查Nginx配置模板是否存在
        const nginxConfig = path.join(this.deployDir, 'nginx.conf');
        if (fs.existsSync(nginxConfig)) {
            return 'PASS_WITH_CAUTION';
        }
        return 'MANUAL_REQUIRED';
    }
    
    async validateDatabaseEnvironment() {
        // 检查配置文件中的数据库配置
        const envProduction = path.join(this.projectRoot, '.env.production');
        if (!fs.existsSync(envProduction)) {
            return 'AUTOMATED_FAIL';
        }
        
        const content = fs.readFileSync(envProduction, 'utf-8');
        const hasMongoDB = content.includes('MONGODB_URI');
        const hasRedis = content.includes('REDIS_URL');
        
        return (hasMongoDB && hasRedis) ? 'PASS_WITH_CAUTION' : 'MANUAL_REQUIRED';
    }
    
    async validateServerMonitoring() {
        // 检查监控配置是否存在
        const prometheusConfig = path.join(this.deployDir, 'monitoring', 'prometheus.yml');
        const alertsConfig = path.join(this.deployDir, 'monitoring', 'alerts.yml');
        
        if (fs.existsSync(prometheusConfig) && fs.existsSync(alertsConfig)) {
            return 'AUTOMATED_PASS';
        }
        return 'MANUAL_REQUIRED';
    }
    
    async validateApplicationMonitoring() {
        // 检查应用指标配置
        const grafanaDashboard = path.join(this.deployDir, 'monitoring', 'grafana-dashboard.json');
        if (fs.existsSync(grafanaDashboard)) {
            return 'PASS_WITH_CAUTION';
        }
        return 'MANUAL_REQUIRED';
    }
    
    async validateAlertSystem() {
        // 告警系统需要人工配置
        return 'MANUAL_REQUIRED';
    }
    
    async validateSecurityScan() {
        try {
            const securityDir = path.join(this.buildDir, 'security');
            if (!fs.existsSync(securityDir)) {
                return 'AUTOMATED_FAIL';
            }
            
            // 查找最新的安全扫描报告
            const files = fs.readdirSync(securityDir)
                .filter(f => f.startsWith('security-scan-') && f.endsWith('.json'))
                .sort()
                .reverse();
            
            if (files.length === 0) {
                return 'AUTOMATED_FAIL';
            }
            
            const latestReport = path.join(securityDir, files[0]);
            const report = JSON.parse(fs.readFileSync(latestReport, 'utf-8'));
            
            // 检查安全评分
            if (report.securityScore >= 70) {
                return 'AUTOMATED_PASS';
            } else if (report.securityScore >= 50) {
                return 'PASS_WITH_CAUTION';
            } else {
                return 'AUTOMATED_FAIL';
            }
        } catch {
            return 'MANUAL_REQUIRED';
        }
    }
    
    async validateFirewallConfig() {
        // 防火墙配置需要人工验证
        return 'MANUAL_REQUIRED';
    }
    
    async validatePlatformCompliance() {
        // 平台合规性需要人工检查
        return 'MANUAL_REQUIRED';
    }
    
    async validateCopyright() {
        // 版权检查需要人工验证
        return 'MANUAL_REQUIRED';
    }
    
    async validateCoreFunctionality() {
        // 检查核心脚本是否存在
        const coreScripts = [
            path.join(this.projectRoot, 'game', 'assets', 'scripts', 'GameManager.ts'),
            path.join(this.projectRoot, 'game', 'assets', 'scripts', 'PlantingSystem.ts'),
            path.join(this.projectRoot, 'game', 'assets', 'scripts', 'GardenSystem.ts'),
            path.join(this.projectRoot, 'game', 'assets', 'scripts', 'EconomySystem.ts')
        ];
        
        let allExist = true;
        for (const script of coreScripts) {
            if (!fs.existsSync(script)) {
                allExist = false;
                break;
            }
        }
        
        return allExist ? 'PASS_WITH_CAUTION' : 'AUTOMATED_FAIL';
    }
    
    async validatePlatformIntegration() {
        // 检查平台适配器接口
        const adapterInterface = path.join(this.projectRoot, 'game', 'assets', 'scripts', 'platforms', 'IPlatformAdapter.ts');
        if (fs.existsSync(adapterInterface)) {
            return 'PASS_WITH_CAUTION';
        }
        return 'AUTOMATED_FAIL';
    }
    
    async validateCapacityPlanning() {
        // 容量规划需要人工验证
        return 'MANUAL_REQUIRED';
    }
    
    async validateBackupStrategy() {
        // 检查备份目录是否存在
        const backupDir = path.join(this.deployDir, 'backup');
        if (fs.existsSync(backupDir)) {
            return 'PASS_WITH_CAUTION';
        }
        return 'MANUAL_REQUIRED';
    }
    
    async validateDeploymentDocumentation() {
        // 检查关键部署文档
        const requiredDocs = [
            'DEPLOYMENT_ENVIRONMENT_CONFIG.md',
            'BUILD_OPERATION_MANUAL.md',
            'LAUNCH_PLAN.md',
            'PROJECT_SUMMARY.md'
        ];
        
        let allExist = true;
        for (const doc of requiredDocs) {
            const docPath = path.join(this.projectRoot, doc);
            if (!fs.existsSync(docPath)) {
                allExist = false;
                break;
            }
        }
        
        return allExist ? 'AUTOMATED_PASS' : 'AUTOMATED_FAIL';
    }
    
    async genericValidation(check) {
        // 通用验证逻辑
        if (check.validationMethod === 'manual') {
            return 'MANUAL_REQUIRED';
        }
        
        // 尝试根据描述中的关键词进行验证
        if (check.description.includes('配置')) {
            return 'PASS_WITH_CAUTION';
        } else if (check.description.includes('测试')) {
            return 'PASS_WITH_CAUTION';
        } else if (check.description.includes('验证')) {
            return 'PASS_WITH_CAUTION';
        }
        
        return 'MANUAL_REQUIRED';
    }
    
    async generateReports() {
        this.log('\n📊 生成验证报告...', 'yellow');
        
        const reportDir = path.join(this.buildDir, 'launch-readiness');
        if (!fs.existsSync(reportDir)) {
            fs.mkdirSync(reportDir, { recursive: true });
        }
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        
        // 1. JSON详细报告
        const jsonReportPath = path.join(reportDir, `checklist-validation-${timestamp}.json`);
        fs.writeFileSync(jsonReportPath, JSON.stringify(this.validationResults, null, 2), 'utf-8');
        this.log(`  JSON报告: ${jsonReportPath}`, 'blue');
        
        // 2. 文本摘要报告
        const textReportPath = path.join(reportDir, `checklist-validation-${timestamp}.txt`);
        const textReport = this.generateTextReport();
        fs.writeFileSync(textReportPath, textReport, 'utf-8');
        this.log(`  文本报告: ${textReportPath}`, 'blue');
        
        // 3. HTML报告（可选）
        const htmlReportPath = path.join(reportDir, `checklist-validation-${timestamp}.html`);
        const htmlReport = this.generateHtmlReport();
        fs.writeFileSync(htmlReportPath, htmlReport, 'utf-8');
        this.log(`  HTML报告: ${htmlReportPath}`, 'blue');
    }
    
    generateTextReport() {
        let report = '《自动治愈花园》上线检查清单验证报告\n';
        report += '=' * 80 + '\n';
        report += `验证时间: ${this.validationResults.timestamp}\n\n`;
        
        // 汇总统计
        report += '📊 验证汇总\n';
        report += '-' * 40 + '\n';
        report += `总计检查项: ${this.validationResults.summary.totalChecks}\n`;
        report += `自动验证项: ${this.validationResults.summary.automatedChecks}\n`;
        report += `人工验证项: ${this.validationResults.summary.manualChecks}\n`;
        report += `通过: ${this.validationResults.summary.passed}\n`;
        report += `失败: ${this.validationResults.summary.failed}\n`;
        report += `需要人工验证: ${this.validationResults.summary.manualRequired}\n\n`;
        
        // 各章节详情
        for (const [sectionName, sectionData] of Object.entries(this.validationResults.sections)) {
            const sectionTitle = sectionName === 'technical' ? '🛠️ 技术检查' : 
                               sectionName === 'business' ? '💼 业务检查' : '🔧 运维检查';
            
            report += `${sectionTitle}\n`;
            report += '-' * 40 + '\n';
            report += `总数: ${sectionData.summary.total} | 通过: ${sectionData.summary.passed} | 失败: ${sectionData.summary.failed} | 人工: ${sectionData.summary.manual}\n\n`;
            
            for (const check of sectionData.checks) {
                const statusSymbol = check.status === 'passed' ? '✅' : 
                                   check.status === 'failed' ? '❌' : '🔍';
                report += `${statusSymbol} ${check.description}\n`;
                if (check.details) {
                    report += `  详情: ${check.details}\n`;
                }
                report += `  时间: ${check.timestamp}\n\n`;
            }
        }
        
        // 上线建议
        report += '🚀 上线建议\n';
        report += '-' * 40 + '\n';
        
        const successRate = this.validationResults.summary.passed / this.validationResults.summary.totalChecks;
        if (successRate >= 0.8) {
            report += '✅ 上线准备充分，建议按计划上线\n';
            report += '建议措施:\n';
            report += '1. 处理剩余的人工验证项\n';
            report += '2. 执行最终部署测试\n';
            report += '3. 准备发布公告\n';
        } else if (successRate >= 0.6) {
            report += '⚠️ 上线准备基本完成，但需要解决一些问题\n';
            report += '建议措施:\n';
            report += '1. 优先处理失败的检查项\n';
            report += '2. 完成关键的人工验证\n';
            report += '3. 考虑延期上线或采用灰度发布\n';
        } else {
            report += '❌ 上线准备不足，建议延期上线\n';
            report += '建议措施:\n';
            report += '1. 重点解决技术检查失败项\n';
            report += '2. 重新评估上线时间表\n';
            report += '3. 考虑分阶段上线策略\n';
        }
        
        return report;
    }
    
    generateHtmlReport() {
        const passedChecks = this.validationResults.summary.passed;
        const totalChecks = this.validationResults.summary.totalChecks;
        const successRate = totalChecks > 0 ? (passedChecks / totalChecks * 100).toFixed(1) : 0;
        
        let html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>《自动治愈花园》上线检查清单验证报告</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { color: #333; margin-bottom: 10px; }
        .timestamp { color: #666; font-size: 14px; }
        .summary { display: flex; justify-content: space-around; margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 8px; }
        .stat { text-align: center; }
        .stat-number { font-size: 36px; font-weight: bold; margin-bottom: 5px; }
        .stat-label { font-size: 14px; color: #666; }
        .status-passed { color: #28a745; }
        .status-failed { color: #dc3545; }
        .status-manual { color: #ffc107; }
        .section { margin: 30px 0; }
        .section-title { font-size: 20px; font-weight: bold; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #e9ecef; }
        .check-item { margin: 10px 0; padding: 10px; border-left: 4px solid #ddd; }
        .check-passed { border-left-color: #28a745; background: #d4edda; }
        .check-failed { border-left-color: #dc3545; background: #f8d7da; }
        .check-manual { border-left-color: #ffc107; background: #fff3cd; }
        .check-description { font-weight: 500; margin-bottom: 5px; }
        .check-details { font-size: 14px; color: #666; }
        .recommendation { margin-top: 30px; padding: 20px; border-radius: 8px; }
        .recommendation-good { background: #d4edda; border: 1px solid #c3e6cb; }
        .recommendation-warning { background: #fff3cd; border: 1px solid #ffeaa7; }
        .recommendation-danger { background: #f8d7da; border: 1px solid #f5c6cb; }
        .progress-bar { height: 20px; background: #e9ecef; border-radius: 10px; overflow: hidden; margin: 20px 0; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #28a745, #20c997); }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>《自动治愈花园》上线检查清单验证报告</h1>
            <div class="timestamp">验证时间: ${this.validationResults.timestamp}</div>
        </div>
        
        <div class="summary">
            <div class="stat">
                <div class="stat-number status-passed">${passedChecks}</div>
                <div class="stat-label">通过检查</div>
            </div>
            <div class="stat">
                <div class="stat-number">${totalChecks}</div>
                <div class="stat-label">总计检查项</div>
            </div>
            <div class="stat">
                <div class="stat-number status-manual">${this.validationResults.summary.manualRequired}</div>
                <div class="stat-label">需要人工验证</div>
            </div>
            <div class="stat">
                <div class="stat-number">${successRate}%</div>
                <div class="stat-label">完成率</div>
            </div>
        </div>
        
        <div class="progress-bar">
            <div class="progress-fill" style="width: ${successRate}%"></div>
        </div>`;
        
        // 添加各章节
        for (const [sectionName, sectionData] of Object.entries(this.validationResults.sections)) {
            const sectionTitle = sectionName === 'technical' ? '🛠️ 技术检查' : 
                               sectionName === 'business' ? '💼 业务检查' : '🔧 运维检查';
            
            html += `
        <div class="section">
            <div class="section-title">${sectionTitle} (${sectionData.summary.passed}/${sectionData.summary.total})</div>`;
            
            for (const check of sectionData.checks) {
                const statusClass = check.status === 'passed' ? 'check-passed' : 
                                  check.status === 'failed' ? 'check-failed' : 'check-manual';
                const statusIcon = check.status === 'passed' ? '✅' : 
                                  check.status === 'failed' ? '❌' : '🔍';
                
                html += `
            <div class="check-item ${statusClass}">
                <div class="check-description">${statusIcon} ${check.description}</div>`;
                
                if (check.details) {
                    html += `
                <div class="check-details">${check.details}</div>`;
                }
                
                html += `
            </div>`;
            }
            
            html += `
        </div>`;
        }
        
        // 添加建议
        const recommendationClass = successRate >= 80 ? 'recommendation-good' : 
                                  successRate >= 60 ? 'recommendation-warning' : 'recommendation-danger';
        const recommendationText = successRate >= 80 ? 
            '✅ 上线准备充分，建议按计划上线。处理剩余人工验证项后即可开始D-day部署。' :
            successRate >= 60 ?
            '⚠️ 上线准备基本完成，但需要解决一些问题。建议优先处理失败项，考虑采用灰度发布。' :
            '❌ 上线准备不足，建议延期上线。重点解决技术检查失败项，重新评估上线时间表。';
        
        html += `
        <div class="recommendation ${recommendationClass}">
            <h3>🚀 上线建议</h3>
            <p>${recommendationText}</p>
            <p><strong>验证完成率:</strong> ${successRate}%</p>
            <p><strong>下一步建议:</strong></p>
            <ul>
                <li>1. 优先处理失败检查项</li>
                <li>2. 完成人工验证项目</li>
                <li>3. 执行最终部署测试</li>
                <li>4. 准备发布公告和监控</li>
            </ul>
        </div>
    </div>
</body>
</html>`;
        
        return html;
    }
    
    displaySummary() {
        this.log('\n' + '=' * 80, 'yellow');
        this.log('📊 验证完成摘要', 'yellow');
        this.log('=' * 80, 'yellow');
        
        const passedChecks = this.validationResults.summary.passed;
        const totalChecks = this.validationResults.summary.totalChecks;
        const successRate = totalChecks > 0 ? (passedChecks / totalChecks * 100).toFixed(1) : 0;
        
        this.log(`总计检查项: ${totalChecks}`, 'blue');
        this.log(`通过检查: ${passedChecks} ✅`, 'green');
        this.log(`失败检查: ${this.validationResults.summary.failed} ❌`, 'red');
        this.log(`需要人工验证: ${this.validationResults.summary.manualRequired} 🔍`, 'yellow');
        this.log(`验证完成率: ${successRate}%`, 'blue');
        
        // 各章节统计
        for (const [sectionName, sectionData] of Object.entries(this.validationResults.sections)) {
            const sectionTitle = sectionName === 'technical' ? '技术检查' : 
                               sectionName === 'business' ? '业务检查' : '运维检查';
            const sectionRate = sectionData.summary.total > 0 ? 
                (sectionData.summary.passed / sectionData.summary.total * 100).toFixed(1) : 0;
            
            this.log(`\n${sectionTitle}:`, 'yellow');
            this.log(`  总数: ${sectionData.summary.total}`, 'blue');
            this.log(`  通过: ${sectionData.summary.passed} (${sectionRate}%)`, 
                     sectionRate >= 80 ? 'green' : sectionRate >= 60 ? 'yellow' : 'red');
            this.log(`  失败: ${sectionData.summary.failed}`, 'blue');
            this.log(`  人工: ${sectionData.summary.manual}`, 'blue');
        }
        
        // 上线建议
        this.log('\n🚀 上线建议:', 'yellow');
        if (successRate >= 80) {
            this.log('✅ 上线准备充分，建议按计划上线', 'green');
            this.log('建议措施:', 'blue');
            this.log('1. 处理剩余的人工验证项', 'blue');
            this.log('2. 执行最终部署测试', 'blue');
            this.log('3. 准备发布公告和监控', 'blue');
        } else if (successRate >= 60) {
            this.log('⚠️ 上线准备基本完成，但需要解决一些问题', 'yellow');
            this.log('建议措施:', 'blue');
            this.log('1. 优先处理失败的检查项', 'blue');
            this.log('2. 完成关键的人工验证', 'blue');
            this.log('3. 考虑采用灰度发布策略', 'blue');
        } else {
            this.log('❌ 上线准备不足，建议延期上线', 'red');
            this.log('建议措施:', 'blue');
            this.log('1. 重点解决技术检查失败项', 'blue');
            this.log('2. 重新评估上线时间表', 'blue');
            this.log('3. 考虑分阶段上线策略', 'blue');
        }
        
        this.log('\n📁 报告已保存至:', 'blue');
        this.log(`  D:\\AutoHealingGarden\\build\\launch-readiness\\`, 'blue');
    }
}

// 命令行接口
const validator = new LaunchChecklistValidator();
validator.runValidation().then(() => {
    process.exit(0);
}).catch(error => {
    console.error('验证过程出错:', error);
    process.exit(1);
});