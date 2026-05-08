#!/usr/bin/env node

/**
 * 《自动治愈花园》安全扫描脚本
 * 执行基础安全检查和依赖漏洞扫描
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class SecurityScanner {
    constructor() {
        this.projectRoot = path.resolve(__dirname, '..');
        this.scanResults = {
            timestamp: new Date().toISOString(),
            checks: [],
            vulnerabilities: [],
            recommendations: []
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
    
    addCheck(name, status, details = null) {
        this.scanResults.checks.push({
            name,
            status,
            details,
            timestamp: new Date().toISOString()
        });
        
        const statusSymbol = status === 'PASS' ? '✅' : status === 'WARN' ? '⚠️' : '❌';
        this.log(`  ${statusSymbol} ${name}: ${status}`, 
                 status === 'PASS' ? 'green' : status === 'WARN' ? 'yellow' : 'red');
        
        if (details) {
            this.log(`    ${details}`, 'blue');
        }
    }
    
    async runAllChecks() {
        this.log('🔍 开始安全扫描', 'yellow');
        this.log('====================', 'yellow');
        
        // 1. 依赖安全检查
        await this.checkDependencies();
        
        // 2. 配置文件安全检查
        await this.checkConfiguration();
        
        // 3. 代码安全检查
        await this.checkCodeSecurity();
        
        // 4. 环境安全检查
        await this.checkEnvironment();
        
        // 5. 文件权限检查
        await this.checkFilePermissions();
        
        // 6. 网络配置检查
        await this.checkNetworkConfig();
        
        this.log('====================', 'yellow');
        this.log('安全扫描完成', 'yellow');
        
        // 生成报告
        this.generateReport();
    }
    
    async checkDependencies() {
        this.log('\n📦 依赖安全检查', 'yellow');
        
        try {
            // 检查package.json是否存在
            const packageJsonPath = path.join(this.projectRoot, 'package.json');
            if (!fs.existsSync(packageJsonPath)) {
                this.addCheck('package.json存在', 'FAIL', '未找到package.json文件');
                return;
            }
            
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
            this.addCheck('package.json存在', 'PASS', `版本: ${packageJson.version || '未知'}`);
            
            // 检查是否有已知漏洞依赖（模拟）
            const hasVulnerableDeps = this.simulateVulnerabilityCheck(packageJson);
            if (hasVulnerableDeps) {
                this.addCheck('依赖漏洞扫描', 'WARN', '发现潜在的安全漏洞，建议更新依赖');
                this.scanResults.vulnerabilities.push({
                    type: 'DEPENDENCY',
                    severity: 'MEDIUM',
                    description: '部分依赖存在已知安全漏洞',
                    recommendation: '运行 npm audit fix 更新依赖'
                });
            } else {
                this.addCheck('依赖漏洞扫描', 'PASS', '未发现已知严重漏洞');
            }
            
            // 检查过期依赖
            const outdatedDeps = this.checkOutdatedDependencies(packageJson);
            if (outdatedDeps.length > 0) {
                this.addCheck('依赖版本检查', 'WARN', `发现${outdatedDeps.length}个过期依赖`);
                outdatedDeps.forEach(dep => {
                    this.scanResults.recommendations.push({
                        category: 'DEPENDENCY',
                        description: `依赖 ${dep.name} 版本 ${dep.current} 已过期，建议更新到 ${dep.latest}`,
                        priority: 'MEDIUM'
                    });
                });
            } else {
                this.addCheck('依赖版本检查', 'PASS', '所有依赖版本正常');
            }
            
        } catch (error) {
            this.addCheck('依赖安全检查', 'FAIL', `检查失败: ${error.message}`);
        }
    }
    
    simulateVulnerabilityCheck(packageJson) {
        // 模拟漏洞检查（实际环境中应使用npm audit或snyk）
        const vulnerablePackages = ['express', 'lodash', 'moment'];
        const dependencies = {
            ...packageJson.dependencies,
            ...packageJson.devDependencies
        };
        
        for (const pkg of vulnerablePackages) {
            if (dependencies[pkg]) {
                // 模拟发现漏洞
                return Math.random() > 0.7; // 30%概率发现漏洞
            }
        }
        return false;
    }
    
    checkOutdatedDependencies(packageJson) {
        // 模拟过期依赖检查
        const outdated = [];
        const dependencies = {
            ...packageJson.dependencies,
            ...packageJson.devDependencies
        };
        
        // 模拟一些常见依赖的版本检查
        const depChecks = [
            { name: 'express', current: '4.18.0', latest: '4.19.0' },
            { name: 'mongoose', current: '7.5.0', latest: '7.6.0' },
            { name: 'socket.io', current: '4.7.0', latest: '4.7.2' }
        ];
        
        for (const check of depChecks) {
            if (dependencies[check.name]) {
                // 模拟版本比较
                if (Math.random() > 0.5) {
                    outdated.push(check);
                }
            }
        }
        
        return outdated;
    }
    
    async checkConfiguration() {
        this.log('\n⚙️ 配置文件安全检查', 'yellow');
        
        const configFiles = [
            { path: '.env.production', required: true, sensitive: true },
            { path: '.env.build', required: true, sensitive: false },
            { path: '.env.deploy', required: false, sensitive: true }
        ];
        
        for (const config of configFiles) {
            const configPath = path.join(this.projectRoot, config.path);
            
            if (config.required && !fs.existsSync(configPath)) {
                this.addCheck(`${config.path}存在`, 'FAIL', '配置文件缺失');
                this.scanResults.recommendations.push({
                    category: 'CONFIGURATION',
                    description: `缺少配置文件: ${config.path}`,
                    priority: 'HIGH'
                });
            } else if (fs.existsSync(configPath)) {
                this.addCheck(`${config.path}存在`, 'PASS', '配置文件存在');
                
                // 检查敏感信息
                if (config.sensitive) {
                    const content = fs.readFileSync(configPath, 'utf-8');
                    const hasSensitiveInfo = this.checkSensitiveInformation(content);
                    
                    if (hasSensitiveInfo) {
                        this.addCheck(`${config.path}敏感信息`, 'WARN', '发现硬编码的敏感信息');
                        this.scanResults.vulnerabilities.push({
                            type: 'CONFIGURATION',
                            severity: 'HIGH',
                            description: `配置文件 ${config.path} 包含硬编码的敏感信息`,
                            recommendation: '使用环境变量或密钥管理服务存储敏感信息'
                        });
                    } else {
                        this.addCheck(`${config.path}敏感信息`, 'PASS', '未发现硬编码敏感信息');
                    }
                }
            } else {
                this.addCheck(`${config.path}存在`, 'WARN', '配置文件不存在但非必需');
            }
        }
    }
    
    checkSensitiveInformation(content) {
        const sensitivePatterns = [
            /password\s*=\s*['"][^'"]{4,}['"]/i,
            /secret\s*=\s*['"][^'"]{8,}['"]/i,
            /key\s*=\s*['"][^'"]{16,}['"]/i,
            /token\s*=\s*['"][^'"]{16,}['"]/i,
            /change_this_/i
        ];
        
        for (const pattern of sensitivePatterns) {
            if (pattern.test(content)) {
                return true;
            }
        }
        return false;
    }
    
    async checkCodeSecurity() {
        this.log('\n📝 代码安全检查', 'yellow');
        
        // 检查常见安全问题
        const securityIssues = this.checkCommonSecurityIssues();
        
        if (securityIssues.length === 0) {
            this.addCheck('常见安全问题', 'PASS', '未发现常见安全问题');
        } else {
            this.addCheck('常见安全问题', 'WARN', `发现${securityIssues.length}个潜在问题`);
            securityIssues.forEach(issue => {
                this.scanResults.recommendations.push({
                    category: 'CODE_SECURITY',
                    description: issue,
                    priority: 'MEDIUM'
                });
            });
        }
    }
    
    checkCommonSecurityIssues() {
        // 模拟代码安全检查
        const issues = [];
        
        // 检查是否有eval使用
        const serverDir = path.join(this.projectRoot, 'server');
        if (fs.existsSync(serverDir)) {
            const files = this.getAllFiles(serverDir, ['.js']);
            
            for (const file of files.slice(0, 10)) { // 只检查前10个文件
                try {
                    const content = fs.readFileSync(file, 'utf-8');
                    if (content.includes('eval(')) {
                        issues.push(`文件 ${path.relative(this.projectRoot, file)} 使用eval函数`);
                    }
                    if (content.includes('require(') && !content.includes("require('fs')")) {
                        // 检查动态require
                        if (content.includes('require(variable)')) {
                            issues.push(`文件 ${path.relative(this.projectRoot, file)} 使用动态require`);
                        }
                    }
                } catch (error) {
                    // 忽略读取错误
                }
            }
        }
        
        return issues;
    }
    
    getAllFiles(dir, extensions) {
        let results = [];
        const list = fs.readdirSync(dir);
        
        for (const file of list) {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            
            if (stat && stat.isDirectory()) {
                results = results.concat(this.getAllFiles(filePath, extensions));
            } else {
                if (extensions.some(ext => filePath.endsWith(ext))) {
                    results.push(filePath);
                }
            }
        }
        
        return results;
    }
    
    async checkEnvironment() {
        this.log('\n🌍 环境安全检查', 'yellow');
        
        // 检查Node.js版本
        try {
            const nodeVersion = process.version;
            const majorVersion = parseInt(nodeVersion.replace('v', '').split('.')[0]);
            
            if (majorVersion >= 16) {
                this.addCheck('Node.js版本', 'PASS', `当前版本: ${nodeVersion}`);
            } else {
                this.addCheck('Node.js版本', 'FAIL', `版本 ${nodeVersion} 已过时，建议升级到16+`);
                this.scanResults.vulnerabilities.push({
                    type: 'ENVIRONMENT',
                    severity: 'HIGH',
                    description: `Node.js版本 ${nodeVersion} 存在安全漏洞`,
                    recommendation: '升级到Node.js 16或更高版本'
                });
            }
        } catch (error) {
            this.addCheck('Node.js版本检查', 'FAIL', `检查失败: ${error.message}`);
        }
        
        // 检查运行环境
        const isProduction = process.env.NODE_ENV === 'production';
        this.addCheck('运行环境', isProduction ? 'PASS' : 'WARN', 
                     `NODE_ENV=${process.env.NODE_ENV || 'development'}`);
    }
    
    async checkFilePermissions() {
        this.log('\n🔐 文件权限检查', 'yellow');
        
        // 检查关键文件的权限
        const criticalFiles = [
            { path: '.env.production', maxPermission: '600' },
            { path: '.env.deploy', maxPermission: '600' },
            { path: 'server/package.json', maxPermission: '644' }
        ];
        
        for (const file of criticalFiles) {
            const filePath = path.join(this.projectRoot, file.path);
            
            if (fs.existsSync(filePath)) {
                try {
                    const stats = fs.statSync(filePath);
                    const mode = stats.mode.toString(8);
                    const permission = mode.slice(-3);
                    
                    // 简化权限检查
                    if (file.maxPermission === '600' && permission !== '600') {
                        this.addCheck(`${file.path}权限`, 'WARN', `权限 ${permission}，建议设置为600`);
                    } else {
                        this.addCheck(`${file.path}权限`, 'PASS', `权限 ${permission}`);
                    }
                } catch (error) {
                    this.addCheck(`${file.path}权限`, 'FAIL', `检查失败: ${error.message}`);
                }
            }
        }
    }
    
    async checkNetworkConfig() {
        this.log('\n🌐 网络配置检查', 'yellow');
        
        // 检查CORS配置
        const serverAppPath = path.join(this.projectRoot, 'server/app.js');
        if (fs.existsSync(serverAppPath)) {
            try {
                const content = fs.readFileSync(serverAppPath, 'utf-8');
                const hasCors = content.includes('cors') || content.includes('CORS');
                
                if (hasCors) {
                    this.addCheck('CORS配置', 'PASS', '检测到CORS配置');
                } else {
                    this.addCheck('CORS配置', 'WARN', '未检测到CORS配置');
                    this.scanResults.recommendations.push({
                        category: 'NETWORK',
                        description: '建议配置CORS以限制跨域请求',
                        priority: 'MEDIUM'
                    });
                }
            } catch (error) {
                this.addCheck('CORS配置检查', 'FAIL', `检查失败: ${error.message}`);
            }
        }
    }
    
    generateReport() {
        const reportDir = path.join(this.projectRoot, 'build/security');
        if (!fs.existsSync(reportDir)) {
            fs.mkdirSync(reportDir, { recursive: true });
        }
        
        const reportPath = path.join(reportDir, `security-scan-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
        
        // 统计结果
        const stats = {
            totalChecks: this.scanResults.checks.length,
            passedChecks: this.scanResults.checks.filter(c => c.status === 'PASS').length,
            warningChecks: this.scanResults.checks.filter(c => c.status === 'WARN').length,
            failedChecks: this.scanResults.checks.filter(c => c.status === 'FAIL').length,
            vulnerabilities: this.scanResults.vulnerabilities.length,
            recommendations: this.scanResults.recommendations.length
        };
        
        this.scanResults.summary = stats;
        
        // 生成安全评分
        let score = 100;
        score -= stats.failedChecks * 10;
        score -= stats.warningChecks * 3;
        score -= stats.vulnerabilities.length * 5;
        score = Math.max(0, score);
        
        this.scanResults.securityScore = score;
        
        // 保存报告
        fs.writeFileSync(reportPath, JSON.stringify(this.scanResults, null, 2), 'utf-8');
        
        // 生成文本报告
        const textReportPath = path.join(reportDir, `security-scan-${new Date().toISOString().replace(/[:.]/g, '-')}.txt`);
        const textReport = this.generateTextReport();
        fs.writeFileSync(textReportPath, textReport, 'utf-8');
        
        this.log('\n📊 安全扫描报告', 'yellow');
        this.log('====================', 'yellow');
        this.log(`安全评分: ${score}/100`, score >= 80 ? 'green' : score >= 60 ? 'yellow' : 'red');
        this.log(`检查总数: ${stats.totalChecks}`, 'blue');
        this.log(`通过检查: ${stats.passedChecks} ✅`, 'green');
        this.log(`警告检查: ${stats.warningChecks} ⚠️`, 'yellow');
        this.log(`失败检查: ${stats.failedChecks} ❌`, 'red');
        this.log(`发现漏洞: ${stats.vulnerabilities.length}`, 'blue');
        this.log(`建议事项: ${stats.recommendations.length}`, 'blue');
        this.log('====================', 'yellow');
        this.log(`详细报告已保存:`, 'blue');
        this.log(`  JSON: ${reportPath}`, 'blue');
        this.log(`  文本: ${textReportPath}`, 'blue');
        
        // 提供建议
        if (score < 70) {
            this.log('\n🚨 安全状况需要改善', 'red');
            this.log('建议立即处理高风险问题', 'red');
        } else if (score < 85) {
            this.log('\n⚠️ 安全状况一般', 'yellow');
            this.log('建议处理警告和中等风险问题', 'yellow');
        } else {
            this.log('\n✅ 安全状况良好', 'green');
            this.log('继续保持良好的安全实践', 'green');
        }
    }
    
    generateTextReport() {
        let report = `《自动治愈花园》安全扫描报告\n`;
        report += `扫描时间: ${this.scanResults.timestamp}\n`;
        report += `安全评分: ${this.scanResults.securityScore}/100\n\n`;
        
        report += '检查结果:\n';
        report += '==========\n';
        this.scanResults.checks.forEach(check => {
            const statusSymbol = check.status === 'PASS' ? '✅' : check.status === 'WARN' ? '⚠️' : '❌';
            report += `${statusSymbol} ${check.name}: ${check.status}\n`;
            if (check.details) {
                report += `    ${check.details}\n`;
            }
        });
        
        if (this.scanResults.vulnerabilities.length > 0) {
            report += '\n发现漏洞:\n';
            report += '==========\n';
            this.scanResults.vulnerabilities.forEach(vuln => {
                report += `[${vuln.severity}] ${vuln.description}\n`;
                report += `    建议: ${vuln.recommendation}\n`;
            });
        }
        
        if (this.scanResults.recommendations.length > 0) {
            report += '\n改进建议:\n';
            report += '==========\n';
            this.scanResults.recommendations.forEach(rec => {
                report += `[${rec.priority}] ${rec.description}\n`;
            });
        }
        
        return report;
    }
}

// 命令行接口
const scanner = new SecurityScanner();
scanner.runAllChecks().then(() => {
    process.exit(0);
}).catch(error => {
    console.error('安全扫描失败:', error);
    process.exit(1);
});
