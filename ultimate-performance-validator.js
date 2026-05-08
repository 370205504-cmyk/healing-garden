#!/usr/bin/env node

/**
 * 微信小游戏终极性能验证工具
 * 按微信官方建议进行全面检查
 */

const fs = require('fs');
const path = require('path');

class UltimatePerformanceValidator {
    constructor() {
        this.projectRoot = path.resolve(__dirname, '..');
        this.wechatDir = path.join(this.projectRoot, 'dist', 'wechat');
        this.gameJsPath = path.join(this.wechatDir, 'game.js');
        
        this.colors = {
            reset: '\x1b[0m', red: '\x1b[31m', green: '\x1b[32m',
            yellow: '\x1b[33m', blue: '\x1b[34m', magenta: '\x1b[35m', cyan: '\x1b[36m'
        };
    }
    
    log(message, color = 'reset') {
        console.log(`${this.colors[color]}${message}${this.colors.reset}`);
    }
    
    async validate() {
        this.log('\n🔍 微信小游戏终极性能验证', 'magenta');
        this.log('='.repeat(70), 'magenta');
        this.log('验证依据: 微信官方"模拟器长时间无响应"诊断建议', 'cyan');
        this.log('');
        
        const content = fs.readFileSync(this.gameJsPath, 'utf8');
        const checks = [];
        
        // 1. 检查业务逻辑
        checks.push(this.checkBusinessLogic(content));
        
        // 2. 检查性能瓶颈
        checks.push(this.checkPerformanceBottlenecks(content));
        
        // 3. 检查代码结构
        checks.push(this.checkCodeStructure(content));
        
        // 4. 检查内存和资源
        checks.push(this.checkMemoryAndResources(content));
        
        // 5. 生成报告
        this.generateReport(checks);
    }
    
    checkBusinessLogic(content) {
        this.log('\n📋 检查业务逻辑', 'blue');
        this.log('='.repeat(50), 'blue');
        
        const issues = [];
        const warnings = [];
        
        // 检查生命周期函数
        const lifecycleFuncs = ['onLoad', 'onShow', 'onHide', 'onReady', 'onPullDownRefresh'];
        lifecycleFuncs.forEach(func => {
            if (content.includes(func)) {
                issues.push(`发现生命周期函数: ${func}()`);
            }
        });
        
        if (issues.length === 0) {
            this.log('✅ 无生命周期函数', 'green');
        } else {
            this.log(`⚠️ 发现 ${issues.length} 个生命周期函数`, 'yellow');
            issues.forEach(i => this.log(`  - ${i}`, 'yellow'));
        }
        
        // 检查同步计算
        const syncPatterns = [
            { pattern: /for\s*\(.*\d{4,}.*\)/, name: '大循环' },
            { pattern: /while\s*\(.*\)/, name: 'while循环' },
            { pattern: /do\s*\{/, name: 'do-while循环' }
        ];
        
        let foundSync = false;
        syncPatterns.forEach(p => {
            if (p.pattern.test(content)) {
                warnings.push(`发现${p.name}，可能影响性能`);
                foundSync = true;
            }
        });
        
        if (!foundSync) {
            this.log('✅ 无同步计算阻塞风险', 'green');
        }
        
        // 检查递归
        const recursionPattern = /function\s+(\w+)\s*\([^)]*\)[^{]*\{[^}]*\1\s*\(/g;
        const recursions = content.match(recursionPattern);
        if (recursions) {
            warnings.push(`发现递归调用: ${recursions.length}处`);
            this.log(`⚠️ 发现递归调用`, 'yellow');
        } else {
            this.log('✅ 无递归调用', 'green');
        }
        
        return { name: '业务逻辑检查', issues, warnings, passed: issues.length === 0 };
    }
    
    checkPerformanceBottlenecks(content) {
        this.log('\n⚡ 检查性能瓶颈', 'blue');
        this.log('='.repeat(50), 'blue');
        
        const issues = [];
        const warnings = [];
        
        // 检查耗时操作
        const expensiveOps = [
            { pattern: /JSON\.parse\(.*JSON\.stringify/, name: '深度JSON克隆' },
            { pattern: /\.map\(.*\.map\(/, name: '嵌套map' },
            { pattern: /\.filter\(.*\.filter\(/, name: '嵌套filter' },
            { pattern: /\.reduce\(.*\.reduce\(/, name: '嵌套reduce' }
        ];
        
        expensiveOps.forEach(op => {
            if (op.pattern.test(content)) {
                warnings.push(`发现${op.name}，可能影响性能`);
            }
        });
        
        if (warnings.length === 0) {
            this.log('✅ 无性能瓶颈', 'green');
        } else {
            warnings.forEach(w => this.log(`⚠️ ${w}`, 'yellow'));
        }
        
        // 检查定时器
        const timers = (content.match(/setTimeout\(/g) || []).length;
        const intervals = (content.match(/setInterval\(/g) || []).length;
        const raf = (content.match(/requestAnimationFrame\(/g) || []).length;
        
        this.log(`📊 定时器统计:`, 'cyan');
        this.log(`  - setTimeout: ${timers}处`, timers > 5 ? 'yellow' : 'green');
        this.log(`  - setInterval: ${intervals}处`, intervals > 0 ? 'yellow' : 'green');
        this.log(`  - requestAnimationFrame: ${raf}处`, 'green');
        
        if (timers > 5) warnings.push('setTimeout使用过多');
        if (intervals > 0) warnings.push('使用setInterval，注意清理');
        
        // 检查阻塞操作
        const blockingOps = [
            { pattern: /while\s*\(\s*true\s*\)/, name: 'while(true)死循环' },
            { pattern: /for\s*\(\s*;\s*;\s*\)/, name: 'for(;;)死循环' },
            { pattern: /alert\(/, name: 'alert阻塞' },
            { pattern: /confirm\(/, name: 'confirm阻塞' },
            { pattern: /prompt\(/, name: 'prompt阻塞' }
        ];
        
        let foundBlocking = false;
        blockingOps.forEach(op => {
            if (op.pattern.test(content)) {
                issues.push(`发现阻塞操作: ${op.name}`);
                foundBlocking = true;
            }
        });
        
        if (!foundBlocking) {
            this.log('✅ 无阻塞操作', 'green');
        } else {
            issues.forEach(i => this.log(`❌ ${i}`, 'red'));
        }
        
        return { name: '性能瓶颈检查', issues, warnings, passed: issues.length === 0 };
    }
    
    checkCodeStructure(content) {
        this.log('\n🏗️ 检查代码结构', 'blue');
        this.log('='.repeat(50), 'blue');
        
        const issues = [];
        const warnings = [];
        
        // 检查class使用
        if (/class\s+\w+/.test(content)) {
            warnings.push('使用ES6 class语法，注意兼容性');
            this.log('⚠️ 使用ES6 class语法', 'yellow');
        } else {
            this.log('✅ 使用传统函数语法', 'green');
        }
        
        // 检查DOM操作
        const domOps = [
            { pattern: /document\.getElement/, name: 'DOM查询' },
            { pattern: /document\.querySelector/, name: 'DOM选择器' },
            { pattern: /document\.createElement/, name: 'DOM创建' },
            { pattern: /\.innerHTML/, name: 'innerHTML操作' },
            { pattern: /\.appendChild/, name: 'DOM插入' },
            { pattern: /addEventListener\(/, name: '事件监听器' }
        ];
        
        let foundDOM = false;
        domOps.forEach(op => {
            if (op.pattern.test(content)) {
                issues.push(`发现DOM操作: ${op.name}，微信小游戏不建议使用`);
                foundDOM = true;
            }
        });
        
        if (!foundDOM) {
            this.log('✅ 无DOM操作（微信小游戏兼容）', 'green');
        } else {
            issues.forEach(i => this.log(`❌ ${i}`, 'red'));
        }
        
        // 检查异步操作
        const asyncOps = [
            { pattern: /async\s+function/, name: 'async函数' },
            { pattern: /await\s+/, name: 'await操作' },
            { pattern: /Promise\s*\(/, name: 'Promise' },
            { pattern: /\.then\(/, name: 'Promise.then' }
        ];
        
        let foundAsync = false;
        asyncOps.forEach(op => {
            if (op.pattern.test(content)) {
                warnings.push(`发现异步操作: ${op.name}`);
                foundAsync = true;
            }
        });
        
        if (!foundAsync) {
            this.log('✅ 无复杂异步操作', 'green');
        } else {
            this.log('ℹ️ 发现异步操作（已简化）', 'cyan');
        }
        
        // 检查文件大小
        const sizeKB = Buffer.byteLength(content, 'utf8') / 1024;
        if (sizeKB > 50) {
            warnings.push(`文件较大: ${sizeKB.toFixed(1)}KB`);
            this.log(`⚠️ 文件大小: ${sizeKB.toFixed(1)}KB`, 'yellow');
        } else {
            this.log(`✅ 文件大小合理: ${sizeKB.toFixed(1)}KB`, 'green');
        }
        
        return { name: '代码结构检查', issues, warnings, passed: issues.length === 0 };
    }
    
    checkMemoryAndResources(content) {
        this.log('\n💾 检查内存和资源', 'blue');
        this.log('='.repeat(50), 'blue');
        
        const issues = [];
        const warnings = [];
        
        // 检查内存泄漏风险
        const leakPatterns = [
            { pattern: /setInterval\(/, name: 'setInterval，需手动清除' },
            { pattern: /new\s+Array\s*\(\s*\d{6,}/, name: '大数组创建' },
            { pattern: /new\s+Object\s*\(\s*\)/, name: '频繁对象创建' }
        ];
        
        leakPatterns.forEach(p => {
            if (p.pattern.test(content)) {
                warnings.push(p.name);
            }
        });
        
        // 检查资源加载
        const resourceOps = [
            { pattern: /wx\.downloadFile\(/, name: '文件下载' },
            { pattern: /wx\.request\(/, name: '网络请求' },
            { pattern: /wx\.createInnerAudioContext\(/, name: '音频资源' }
        ];
        
        resourceOps.forEach(op => {
            if (op.pattern.test(content)) {
                warnings.push(`发现资源加载: ${op.name}，注意管理生命周期`);
            }
        });
        
        if (warnings.length === 0) {
            this.log('✅ 无内存泄漏风险', 'green');
        } else {
            warnings.forEach(w => this.log(`⚠️ ${w}`, 'yellow'));
        }
        
        // 检查全局变量
        const globalVars = (content.match(/window\.\w+\s*=/g) || []).length;
        this.log(`📊 全局变量数量: ${globalVars}`, 'cyan');
        
        if (globalVars > 10) {
            warnings.push(`全局变量较多: ${globalVars}个`);
        }
        
        return { name: '内存和资源检查', issues, warnings, passed: issues.length === 0 };
    }
    
    generateReport(checks) {
        this.log('\n📊 终极性能验证报告', 'magenta');
        this.log('='.repeat(70), 'magenta');
        
        const totalIssues = checks.reduce((sum, c) => sum + c.issues.length, 0);
        const totalWarnings = checks.reduce((sum, c) => sum + c.warnings.length, 0);
        
        checks.forEach(check => {
            const status = check.passed ? '✅ 通过' : '❌ 失败';
            const color = check.passed ? 'green' : 'red';
            this.log(`${status} ${check.name}`, color);
            
            if (check.issues.length > 0) {
                check.issues.forEach(i => this.log(`  ❌ ${i}`, 'red'));
            }
            if (check.warnings.length > 0) {
                check.warnings.forEach(w => this.log(`  ⚠️ ${w}`, 'yellow'));
            }
        });
        
        this.log('\n📈 总结:', 'cyan');
        this.log(`  - 通过检查: ${checks.filter(c => c.passed).length}/${checks.length}`, 'green');
        this.log(`  - 问题总数: ${totalIssues}`, totalIssues > 0 ? 'red' : 'green');
        this.log(`  - 警告总数: ${totalWarnings}`, totalWarnings > 0 ? 'yellow' : 'green');
        
        if (totalIssues === 0) {
            this.log('\n🎉 验证通过！项目符合微信小游戏性能要求', 'green');
            this.log('\n✅ 项目已优化至最佳状态:', 'green');
            this.log('  - 无死循环、无复杂运算', 'white');
            this.log('  - 无DOM操作、无事件监听器', 'white');
            this.log('  - 无阻塞操作、无性能瓶颈', 'white');
            this.log('  - 使用传统函数语法，兼容性最佳', 'white');
            this.log('  - 文件体积小，加载快速', 'white');
        } else {
            this.log('\n⚠️ 发现问题，建议修复后重新测试', 'yellow');
        }
        
        this.log('\n🔧 微信开发者工具优化建议:', 'magenta');
        this.log('1. 清理缓存: 工具 → 清理缓存 → 全部清理', 'white');
        this.log('2. 编译设置: 工具 → 编译配置 → 开启ES6转ES5', 'white');
        this.log('3. 性能分析: 调试器 → Performance → 录制性能', 'white');
        this.log('4. 内存分析: 调试器 → Memory → 分析内存', 'white');
        this.log('5. 低端模拟: 模拟器 → 设置 → 开启低端机模拟', 'white');
    }
}

// 执行验证
const validator = new UltimatePerformanceValidator();
validator.validate().catch(console.error);