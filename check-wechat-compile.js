#!/usr/bin/env node

/**
 * 微信小游戏编译问题诊断工具
 * 检查game.js中的死循环、复杂运算和编译问题
 */

const fs = require('fs');
const path = require('path');

class WechatCompileChecker {
    constructor() {
        this.projectRoot = path.resolve(__dirname);
        this.wechatDir = path.join(this.projectRoot, 'dist', 'wechat');
        this.gameJsPath = path.join(this.wechatDir, 'game.js');
        
        this.issues = [];
        this.warnings = [];
        
        this.colors = {
            reset: '\x1b[0m',
            red: '\x1b[31m',
            green: '\x1b[32m',
            yellow: '\x1b[33m',
            blue: '\x1b[34m',
            magenta: '\x1b[35m',
            cyan: '\x1b[36m'
        };
    }
    
    log(message, color = 'reset') {
        console.log(`${this.colors[color]}${message}${this.colors.reset}`);
    }
    
    async runCheck() {
        this.log('\n🔍 微信小游戏编译问题诊断', 'magenta');
        this.log('='.repeat(60), 'magenta');
        
        // 1. 检查文件存在性
        if (!await this.checkFiles()) {
            return;
        }
        
        // 2. 分析game.js文件
        await this.analyzeGameJs();
        
        // 3. 检查项目配置
        await this.checkProjectConfig();
        
        // 4. 生成修复建议
        await this.generateSolutions();
        
        // 5. 创建简化版本
        await this.createSimplifiedVersion();
    }
    
    async checkFiles() {
        this.log('\n📁 检查文件完整性...', 'blue');
        
        const requiredFiles = [
            { path: this.gameJsPath, name: 'game.js' },
            { path: path.join(this.wechatDir, 'game.json'), name: 'game.json' },
            { path: path.join(this.wechatDir, 'project.config.json'), name: 'project.config.json' },
            { path: path.join(this.wechatDir, 'assets'), name: 'assets/' }
        ];
        
        let allExist = true;
        for (const file of requiredFiles) {
            if (fs.existsSync(file.path)) {
                if (file.path.endsWith('/')) {
                    this.log(`✅ ${file.name} 目录存在`, 'green');
                } else {
                    const stats = fs.statSync(file.path);
                    this.log(`✅ ${file.name} 存在 (${stats.size} bytes)`, 'green');
                }
            } else {
                this.log(`❌ ${file.name} 缺失`, 'red');
                this.issues.push(`${file.name} 文件缺失`);
                allExist = false;
            }
        }
        
        return allExist;
    }
    
    async analyzeGameJs() {
        this.log('\n📊 分析 game.js 文件...', 'blue');
        
        try {
            const content = fs.readFileSync(this.gameJsPath, 'utf8');
            const lines = content.split('\n');
            const sizeKB = Buffer.byteLength(content, 'utf8') / 1024;
            
            this.log(`📄 文件大小: ${sizeKB.toFixed(1)} KB (${lines.length} 行)`, 'cyan');
            
            // 检查潜在的死循环模式
            this.checkForLoops(content);
            
            // 检查复杂的计算
            this.checkComplexComputations(content);
            
            // 检查递归调用
            this.checkRecursion(content);
            
            // 检查setInterval/setTimeout滥用
            this.checkTimers(content);
            
            // 检查语法错误
            this.checkSyntax(content);
            
            // 检查文件大小是否过大
            if (sizeKB > 100) {
                this.warnings.push(`game.js 文件较大 (${sizeKB.toFixed(1)} KB)，可能导致编译缓慢`);
            }
            
        } catch (error) {
            this.log(`❌ 无法读取或分析 game.js: ${error.message}`, 'red');
            this.issues.push(`game.js 文件读取失败: ${error.message}`);
        }
    }
    
    checkForLoops(content) {
        this.log('🔄 检查死循环...', 'blue');
        
        const loopPatterns = [
            { pattern: /while\s*\(\s*true\s*\)/g, name: 'while(true) 死循环' },
            { pattern: /for\s*\(\s*;\s*;\s*\)/g, name: 'for(;;) 死循环' },
            { pattern: /while\s*\(\s*1\s*\)/g, name: 'while(1) 死循环' },
            { pattern: /while\s*\(\s*!stop\s*\)/g, name: '依赖变量的循环' },
            { pattern: /do\s*\{[\s\S]*?\}\s*while\s*\(\s*true\s*\)/g, name: 'do-while(true) 死循环' }
        ];
        
        let foundLoops = false;
        for (const pattern of loopPatterns) {
            const matches = content.match(pattern.pattern);
            if (matches) {
                this.log(`❌ 发现: ${pattern.name} (${matches.length}处)`, 'red');
                this.issues.push(`发现 ${pattern.name}`);
                foundLoops = true;
            }
        }
        
        if (!foundLoops) {
            this.log('✅ 未发现明显的死循环', 'green');
        }
    }
    
    checkComplexComputations(content) {
        this.log('🧮 检查复杂计算...', 'blue');
        
        const complexPatterns = [
            { pattern: /for\s*\(.*let\s+i\s*=\s*0.*i\s*<\s*\d{4,}.*i\+\+\)/g, name: '大循环 (>1000次)' },
            { pattern: /JSON\.parse\(.*JSON\.stringify/g, name: '深度JSON克隆' },
            { pattern: /eval\(/g, name: 'eval() 函数' },
            { pattern: /new\s+Function\(/g, name: 'new Function() 动态代码' },
            { pattern: /\.map\(.*=>.*\{.*\{/g, name: '嵌套数组操作' }
        ];
        
        let foundComplex = false;
        for (const pattern of complexPatterns) {
            const matches = content.match(pattern.pattern);
            if (matches) {
                this.log(`⚠️ 发现: ${pattern.name} (${matches.length}处)`, 'yellow');
                this.warnings.push(`发现 ${pattern.name}，可能导致性能问题`);
                foundComplex = true;
            }
        }
        
        if (!foundComplex) {
            this.log('✅ 未发现明显的复杂计算', 'green');
        }
    }
    
    checkRecursion(content) {
        this.log('🔄 检查递归调用...', 'blue');
        
        // 查找函数调用自身的模式
        const lines = content.split('\n');
        const functionNames = new Set();
        
        // 收集函数定义
        const functionDefRegex = /function\s+(\w+)\s*\(|const\s+(\w+)\s*=\s*\(.*\)\s*=>|let\s+(\w+)\s*=\s*function/;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const match = line.match(functionDefRegex);
            if (match) {
                const funcName = match[1] || match[2] || match[3];
                if (funcName) {
                    functionNames.add(funcName);
                }
            }
        }
        
        // 检查递归调用
        let foundRecursion = false;
        for (const funcName of functionNames) {
            const recursionRegex = new RegExp(`\\b${funcName}\\s*\\(`, 'g');
            const matches = content.match(recursionRegex);
            if (matches && matches.length > 1) {
                // 简单的检查，实际上需要更复杂的分析来确定是否是递归
                this.log(`⚠️ 可能发现递归调用: ${funcName}()`, 'yellow');
                this.warnings.push(`可能发现递归调用: ${funcName}()`);
                foundRecursion = true;
            }
        }
        
        if (!foundRecursion) {
            this.log('✅ 未发现明显的递归调用', 'green');
        }
    }
    
    checkTimers(content) {
        this.log('⏰ 检查定时器滥用...', 'blue');
        
        const timerPatterns = [
            { pattern: /setInterval\(/g, name: 'setInterval' },
            { pattern: /setTimeout\(/g, name: 'setTimeout' }
        ];
        
        let timerCount = 0;
        for (const pattern of timerPatterns) {
            const matches = content.match(pattern.pattern);
            if (matches) {
                timerCount += matches.length;
                this.log(`📊 ${pattern.name}: ${matches.length}处`, 'cyan');
            }
        }
        
        if (timerCount > 5) {
            this.log(`⚠️ 定时器较多 (${timerCount}处)，可能导致性能问题`, 'yellow');
            this.warnings.push(`定时器较多 (${timerCount}处)`);
        } else if (timerCount > 0) {
            this.log(`✅ 定时器数量正常 (${timerCount}处)`, 'green');
        } else {
            this.log('✅ 未使用定时器', 'green');
        }
    }
    
    checkSyntax(content) {
        this.log('📝 检查语法问题...', 'blue');
        
        try {
            // 尝试解析JavaScript
            eval('(function() { ' + content + ' })');
            this.log('✅ 语法检查通过', 'green');
        } catch (error) {
            this.log(`❌ 语法错误: ${error.message}`, 'red');
            this.issues.push(`JavaScript语法错误: ${error.message}`);
        }
    }
    
    async checkProjectConfig() {
        this.log('\n⚙️ 检查项目配置...', 'blue');
        
        try {
            const configPath = path.join(this.wechatDir, 'project.config.json');
            const configContent = fs.readFileSync(configPath, 'utf8');
            const config = JSON.parse(configContent);
            
            // 检查关键配置
            if (!config.appid || config.appid === '') {
                this.log('❌ appid 为空', 'red');
                this.issues.push('project.config.json 中 appid 为空');
            } else {
                this.log(`✅ appid: ${config.appid}`, 'green');
            }
            
            if (!config.description) {
                this.log('⚠️ description 为空', 'yellow');
                this.warnings.push('project.config.json 中 description 为空');
            }
            
            // 检查编译设置
            if (config.setting) {
                if (config.setting.es6 === false) {
                    this.log('⚠️ es6 支持被禁用', 'yellow');
                    this.warnings.push('es6 支持被禁用，可能导致现代语法问题');
                }
                
                if (config.setting.minified === false) {
                    this.log('ℹ️ 代码压缩被禁用', 'cyan');
                }
            }
            
        } catch (error) {
            this.log(`❌ 无法读取项目配置: ${error.message}`, 'red');
            this.issues.push(`project.config.json 读取失败: ${error.message}`);
        }
    }
    
    async generateSolutions() {
        this.log('\n🚀 编译问题解决方案', 'magenta');
        this.log('='.repeat(60), 'magenta');
        
        if (this.issues.length === 0 && this.warnings.length === 0) {
            this.log('🎉 未发现编译问题!', 'green');
            this.log('如果仍然无法编译，请尝试以下操作:', 'cyan');
            this.log('1. 清理微信开发者工具缓存', 'white');
            this.log('2. 重启微信开发者工具', 'white');
            this.log('3. 检查网络连接', 'white');
            return;
        }
        
        if (this.issues.length > 0) {
            this.log('❌ 发现的问题:', 'red');
            this.issues.forEach(issue => {
                this.log(`  • ${issue}`, 'red');
            });
            this.log('');
        }
        
        if (this.warnings.length > 0) {
            this.log('⚠️ 警告信息:', 'yellow');
            this.warnings.forEach(warning => {
                this.log(`  • ${warning}`, 'yellow');
            });
            this.log('');
        }
        
        // 通用解决方案
        this.log('💡 解决方案:', 'cyan');
        
        if (this.issues.some(i => i.includes('死循环'))) {
            this.log('1. 移除或修复死循环代码', 'white');
            this.log('2. 添加循环终止条件', 'white');
            this.log('3. 使用setTimeout替代while循环', 'white');
        }
        
        if (this.issues.some(i => i.includes('语法错误'))) {
            this.log('1. 检查JavaScript语法错误', 'white');
            this.log('2. 使用在线JS验证工具检查代码', 'white');
            this.log('3. 简化复杂表达式', 'white');
        }
        
        if (this.warnings.some(w => w.includes('定时器较多'))) {
            this.log('1. 合并多个定时器', 'white');
            this.log('2. 使用requestAnimationFrame替代setInterval', 'white');
            this.log('3. 确保定时器有清除逻辑', 'white');
        }
        
        // 微信开发者工具特定建议
        this.log('\n🛠️ 微信开发者工具建议:', 'magenta');
        this.log('1. 工具 → 清理缓存 → 全部清理', 'white');
        this.log('2. 项目 → 重新打开项目', 'white');
        this.log('3. 工具 → 编译配置 → 开启ES6转ES5', 'white');
        this.log('4. 工具 → 项目设置 → 关闭代码保护', 'white');
        this.log('5. 降低模拟器性能要求: 工具 → 设置 → 代理设置 → 不使用任何代理', 'white');
    }
    
    async createSimplifiedVersion() {
        this.log('\n✨ 创建简化版本...', 'blue');
        
        try {
            const simpleDir = path.join(this.wechatDir, 'simple-version');
            if (!fs.existsSync(simpleDir)) {
                fs.mkdirSync(simpleDir, { recursive: true });
            }
            
            // 创建最简单的game.js
            const simpleGameJs = `// 自动治愈花园 - 简化测试版
console.log('简化版本启动');

// 最简单的游戏逻辑
class SimpleGame {
    constructor() {
        this.score = 0;
        console.log('游戏初始化完成');
    }
    
    start() {
        console.log('游戏开始');
        this.updateScore();
    }
    
    updateScore() {
        this.score += 10;
        console.log('当前分数:', this.score);
        
        // 使用setTimeout避免死循环
        setTimeout(() => {
            this.updateScore();
        }, 1000);
    }
}

// 微信API简化
if (typeof wx !== 'undefined') {
    console.log('微信环境检测到');
    wx.showToast({ title: '游戏启动', icon: 'success' });
} else {
    console.log('非微信环境，使用模拟API');
}

// 启动游戏
window.game = new SimpleGame();
setTimeout(() => window.game.start(), 500);

console.log('✅ 简化版本就绪');`;
            
            fs.writeFileSync(path.join(simpleDir, 'game.js'), simpleGameJs, 'utf8');
            
            // 复制其他必要文件
            const filesToCopy = ['game.json', 'project.config.json'];
            for (const file of filesToCopy) {
                const src = path.join(this.wechatDir, file);
                const dest = path.join(simpleDir, file);
                if (fs.existsSync(src)) {
                    fs.copyFileSync(src, dest);
                }
            }
            
            // 创建简单的assets目录
            const simpleAssetsDir = path.join(simpleDir, 'assets');
            if (!fs.existsSync(simpleAssetsDir)) {
                fs.mkdirSync(simpleAssetsDir, { recursive: true });
            }
            
            this.log(`✅ 简化版本创建完成: ${simpleDir}`, 'green');
            this.log('💡 使用简化版本测试编译:', 'cyan');
            this.log(`1. 在微信开发者工具中打开: ${simpleDir}`, 'white');
            this.log('2. 检查是否能正常编译和运行', 'white');
            this.log('3. 如果简化版本能运行，问题可能在原game.js文件中', 'white');
            
        } catch (error) {
            this.log(`❌ 创建简化版本失败: ${error.message}`, 'red');
        }
    }
}

// 运行检查
const checker = new WechatCompileChecker();
checker.runCheck().catch(console.error);