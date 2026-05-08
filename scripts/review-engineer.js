#!/usr/bin/env node

/**
 * 审核专员岗位脚本
 * 负责技术审核和合规检查（二级验收）
 * 严格审核构建打包工程师的工作成果
 */

const fs = require('fs');
const path = require('path');

class ReviewEngineer {
    constructor() {
        this.projectRoot = path.resolve(__dirname, '..');
        this.buildDir = path.join(this.projectRoot, 'build');
        this.reviewReports = [];
        
        console.log('========================================');
        console.log('审核专员岗位启动（二级验收）');
        console.log('========================================');
        console.log(`项目根目录: ${this.projectRoot}`);
        console.log(`构建目录: ${this.buildDir}`);
        console.log('========================================\n');
    }
    
    /**
     * 审核构建打包工程师的工作
     */
    async reviewBuildEngineerWork() {
        console.log('🔍 审核构建打包工程师工作成果');
        console.log('========================================');
        
        const reviewResults = {
            buildEngineerReport: await this.reviewBuildEngineerReport(),
            buildConfiguration: await this.reviewBuildConfiguration(),
            buildScripts: await this.reviewBuildScripts(),
            deploymentScripts: await this.reviewDeploymentScripts(),
            documentation: await this.reviewDocumentation(),
            compliance: await this.reviewCompliance(),
        };
        
        // 汇总审核结果
        // 注意：有警告的项目仍然算通过，只有问题才算不通过
        const allPassed = Object.values(reviewResults).every(result => result.passed);
        const passedCount = Object.values(reviewResults).filter(r => r.passed).length;
        const totalCount = Object.keys(reviewResults).length;
        const warningCount = Object.values(reviewResults).filter(r => r.hasWarnings).length;
        
        console.log('\n📊 审核结果汇总');
        console.log('========================================');
        console.log(`审核项: ${totalCount}`);
        console.log(`通过: ${passedCount}`);
        console.log(`未通过: ${totalCount - passedCount}`);
        console.log(`警告: ${warningCount}`);
        console.log(`总体结果: ${allPassed ? '✅ 通过' : '❌ 未通过'}`);
        console.log('========================================\n');
        
        // 生成审核报告
        await this.generateReviewReport(reviewResults, allPassed);
        
        return { allPassed, reviewResults };
    }
    
    /**
     * 审核构建工程师报告
     */
    async reviewBuildEngineerReport() {
        console.log('📋 审核构建工程师报告');
        
        const reportPath = path.join(this.buildDir, 'build-engineer-report.json');
        if (!fs.existsSync(reportPath)) {
            return { passed: false, issues: ['构建工程师报告不存在'] };
        }
        
        try {
            const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
            
            const checks = [
                { name: '报告格式正确', check: () => typeof report === 'object' },
                { name: '包含时间戳', check: () => report.timestamp && new Date(report.timestamp).toString() !== 'Invalid Date' },
                { name: '项目信息完整', check: () => report.project && report.project === '自动治愈花园' },
                { name: '岗位自检通过', check: () => report.buildEngineer && report.buildEngineer.selfCheck === true },
                { name: '任务完成记录', check: () => report.buildEngineer && Array.isArray(report.buildEngineer.tasksCompleted) },
                { name: '项目结构检查', check: () => report.projectStructure && 
                    report.projectStructure.gameClient === 'complete' &&
                    report.projectStructure.server === 'complete' &&
                    report.projectStructure.tests === 'complete' },
                { name: '构建配置完整', check: () => report.buildConfiguration && 
                    Array.isArray(report.buildConfiguration.platforms) &&
                    report.buildConfiguration.platforms.length === 3 },
                { name: '下一步计划', check: () => report.nextSteps && Array.isArray(report.nextSteps) },
                { name: '验收要求', check: () => report.verificationRequirements && 
                    report.verificationRequirements.includes('岗位自检已完成') },
            ];
            
            const issues = [];
            for (const check of checks) {
                try {
                    if (!check.check()) {
                        issues.push(check.name);
                    }
                } catch (error) {
                    issues.push(`${check.name}: ${error.message}`);
                }
            }
            
            const passed = issues.length === 0;
            console.log(`  ${passed ? '✅' : '❌'} 报告审核: ${passed ? '通过' : '未通过'}`);
            if (issues.length > 0) {
                console.log(`    问题: ${issues.join(', ')}`);
            }
            
            return { passed, issues, report };
        } catch (error) {
            console.log(`  ❌ 报告审核: 解析失败 - ${error.message}`);
            return { passed: false, issues: [`报告解析失败: ${error.message}`] };
        }
    }
    
    /**
     * 审核构建配置
     */
    async reviewBuildConfiguration() {
        console.log('⚙️ 审核构建配置');
        
        const configDir = path.join(this.buildDir, 'config');
        const checks = [
            { 
                name: '配置目录存在', 
                check: () => fs.existsSync(configDir) && fs.statSync(configDir).isDirectory(),
                issue: '构建配置目录不存在',
            },
            { 
                name: '构建配置文件存在', 
                check: () => fs.existsSync(path.join(configDir, 'build-config.json')),
                issue: '构建配置文件不存在',
            },
            { 
                name: '环境变量模板存在', 
                check: () => fs.existsSync(path.join(configDir, '.env.build.example')),
                issue: '环境变量模板不存在',
            },
        ];
        
        const issues = [];
        for (const check of checks) {
            try {
                if (!check.check()) {
                    issues.push(check.issue);
                }
            } catch (error) {
                issues.push(`${check.name}: ${error.message}`);
            }
        }
        
        if (issues.length === 0) {
            // 检查配置文件内容
            try {
                const configPath = path.join(configDir, 'build-config.json');
                const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
                
                const contentChecks = [
                    { name: '版本号格式正确', check: () => config.version && /^\d+\.\d+\.\d+$/.test(config.version) },
                    { name: '构建日期有效', check: () => config.buildDate && new Date(config.buildDate).toString() !== 'Invalid Date' },
                    { name: '平台配置完整', check: () => config.platforms && 
                        config.platforms.web && config.platforms.wechat && config.platforms.douyin },
                    { name: '优化配置存在', check: () => config.optimization && 
                        typeof config.optimization.compressImages === 'boolean' },
                    { name: '验收配置完整', check: () => config.verification && 
                        config.verification.requireSelfCheck === true &&
                        config.verification.qualityGates },
                ];
                
                for (const check of contentChecks) {
                    try {
                        if (!check.check()) {
                            issues.push(check.name);
                        }
                    } catch (error) {
                        issues.push(`${check.name}: ${error.message}`);
                    }
                }
            } catch (error) {
                issues.push(`配置文件解析失败: ${error.message}`);
            }
        }
        
        const passed = issues.length === 0;
        console.log(`  ${passed ? '✅' : '❌'} 配置审核: ${passed ? '通过' : '未通过'}`);
        if (issues.length > 0) {
            console.log(`    问题: ${issues.join(', ')}`);
        }
        
        return { passed, issues };
    }
    
    /**
     * 审核构建脚本
     */
    async reviewBuildScripts() {
        console.log('📜 审核构建脚本');
        
        const scriptsDir = path.join(this.buildDir, 'scripts');
        const requiredScripts = [
            'build.js',
            'build-all.js',
        ];
        
        const issues = [];
        
        // 检查脚本目录
        if (!fs.existsSync(scriptsDir) || !fs.statSync(scriptsDir).isDirectory()) {
            issues.push('构建脚本目录不存在');
        } else {
            // 检查必需脚本
            for (const script of requiredScripts) {
                const scriptPath = path.join(scriptsDir, script);
                if (!fs.existsSync(scriptPath)) {
                    issues.push(`缺失脚本: ${script}`);
                } else {
                    // 检查脚本内容基本格式
                    try {
                        const content = fs.readFileSync(scriptPath, 'utf-8');
                        if (!content.includes('#!/usr/bin/env node')) {
                            issues.push(`${script}: 缺少Node.js执行头`);
                        }
                        if (!content.includes('class') && !content.includes('function')) {
                            issues.push(`${script}: 脚本结构不完整`);
                        }
                    } catch (error) {
                        issues.push(`${script}: 读取失败 - ${error.message}`);
                    }
                }
            }
        }
        
        const passed = issues.length === 0;
        console.log(`  ${passed ? '✅' : '❌'} 脚本审核: ${passed ? '通过' : '未通过'}`);
        if (issues.length > 0) {
            console.log(`    问题: ${issues.join(', ')}`);
        }
        
        return { passed, issues };
    }
    
    /**
     * 审核部署脚本
     */
    async reviewDeploymentScripts() {
        console.log('🚀 审核部署脚本');
        
        const deployDir = path.join(this.buildDir, 'deploy');
        const requiredScripts = [
            'deploy-check.js',
        ];
        
        const issues = [];
        
        // 检查部署目录
        if (!fs.existsSync(deployDir) || !fs.statSync(deployDir).isDirectory()) {
            issues.push('部署脚本目录不存在');
        } else {
            // 检查必需脚本
            for (const script of requiredScripts) {
                const scriptPath = path.join(deployDir, script);
                if (!fs.existsSync(scriptPath)) {
                    issues.push(`缺失部署脚本: ${script}`);
                }
            }
        }
        
        const passed = issues.length === 0;
        console.log(`  ${passed ? '✅' : '❌'} 部署脚本审核: ${passed ? '通过' : '未通过'}`);
        if (issues.length > 0) {
            console.log(`    问题: ${issues.join(', ')}`);
        }
        
        return { passed, issues };
    }
    
    /**
     * 审核文档
     */
    async reviewDocumentation() {
        console.log('📚 审核文档');
        
        const requiredDocs = [
            { path: path.join(this.buildDir, 'README.md'), name: '构建文档' },
            { path: path.join(this.buildDir, 'build-engineer-report.txt'), name: '构建报告文本版' },
        ];
        
        const issues = [];
        
        for (const doc of requiredDocs) {
            if (!fs.existsSync(doc.path)) {
                issues.push(`缺失文档: ${doc.name}`);
            } else {
                try {
                    const content = fs.readFileSync(doc.path, 'utf-8');
                    if (content.trim().length === 0) {
                        issues.push(`${doc.name}: 内容为空`);
                    }
                    
                    // 检查构建文档的关键章节
                    if (doc.name === '构建文档') {
                        const requiredSections = [
                            '三级验收流程',
                            '构建环境要求',
                            '构建平台',
                            '自动化构建脚本',
                            '部署准备',
                        ];
                        
                        for (const section of requiredSections) {
                            if (!content.includes(section)) {
                                issues.push(`构建文档缺失章节: ${section}`);
                            }
                        }
                    }
                } catch (error) {
                    issues.push(`${doc.name}: 读取失败 - ${error.message}`);
                }
            }
        }
        
        const passed = issues.length === 0;
        console.log(`  ${passed ? '✅' : '❌'} 文档审核: ${passed ? '通过' : '未通过'}`);
        if (issues.length > 0) {
            console.log(`    问题: ${issues.join(', ')}`);
        }
        
        return { passed, issues };
    }
    
    /**
     * 审核合规性
     */
    async reviewCompliance() {
        console.log('⚖️ 审核合规性');
        
        const issues = [];
        const warnings = [];
        
        // 检查平台配置合规性
        try {
            const configPath = path.join(this.buildDir, 'config', 'build-config.json');
            if (fs.existsSync(configPath)) {
                const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
                
                // 检查微信平台配置
                if (config.platforms && config.platforms.wechat) {
                    const wechatConfig = config.platforms.wechat;
                    
                    // AppID配置检查（模板配置是允许的，但需要提醒）
                    if (!wechatConfig.appId) {
                        issues.push('微信AppID配置缺失');
                    } else if (wechatConfig.appId === '${WECHAT_APP_ID}') {
                        warnings.push('微信AppID使用模板配置，实际部署前需替换为真实AppID');
                    }
                    
                    // 权限配置检查
                    if (!Array.isArray(wechatConfig.permission)) {
                        issues.push('微信权限配置格式不正确');
                    } else if (wechatConfig.permission.length === 0) {
                        warnings.push('微信权限配置为空，建议配置必要权限');
                    }
                }
                
                // 检查抖音平台配置
                if (config.platforms && config.platforms.douyin) {
                    const douyinConfig = config.platforms.douyin;
                    
                    if (!douyinConfig.appId) {
                        issues.push('抖音AppID配置缺失');
                    } else if (douyinConfig.appId === '${DOUYIN_APP_ID}') {
                        warnings.push('抖音AppID使用模板配置，实际部署前需替换为真实AppID');
                    }
                }
                
                // 检查质量门禁配置
                if (config.verification && config.verification.qualityGates) {
                    const gates = config.verification.qualityGates;
                    if (gates.maxBundleSize <= 0) {
                        issues.push('质量门禁: 包体大小阈值配置不正确');
                    } else if (gates.maxBundleSize > 50 * 1024 * 1024) {
                        warnings.push('质量门禁: 包体大小阈值过高（超过50MB）');
                    }
                    
                    if (gates.minFps <= 0) {
                        issues.push('质量门禁: 最小帧率阈值配置不正确');
                    } else if (gates.minFps < 20) {
                        warnings.push('质量门禁: 最小帧率阈值过低（低于20FPS）');
                    }
                    
                    if (!gates.maxMemory || gates.maxMemory <= 0) {
                        issues.push('质量门禁: 最大内存阈值配置不正确');
                    }
                }
            }
        } catch (error) {
            issues.push(`合规检查失败: ${error.message}`);
        }
        
        const passed = issues.length === 0;
        console.log(`  ${passed ? '✅' : '❌'} 合规审核: ${passed ? '通过' : '未通过'}`);
        
        if (issues.length > 0) {
            console.log(`    问题: ${issues.join(', ')}`);
        }
        
        if (warnings.length > 0) {
            console.log(`    警告: ${warnings.join(', ')}`);
        }
        
        return { 
            passed, 
            issues,
            warnings,
            hasWarnings: warnings.length > 0,
        };
    }
    
    /**
     * 生成审核报告
     */
    async generateReviewReport(reviewResults, overallPassed) {
        const report = {
            timestamp: new Date().toISOString(),
            project: "自动治愈花园",
            reviewer: "审核专员",
            reviewType: "二级验收（技术审核）",
            overallResult: overallPassed ? "通过" : "未通过",
            reviewDetails: reviewResults,
            summary: {
                totalItems: Object.keys(reviewResults).length,
                passedItems: Object.values(reviewResults).filter(r => r.passed).length,
                failedItems: Object.values(reviewResults).filter(r => !r.passed).length,
            },
            recommendations: this.generateRecommendations(reviewResults),
            verificationStatus: {
                selfCheck: "已完成（构建工程师）",
                reviewerCheck: overallPassed ? "通过" : "未通过",
                finalCheck: "等待总指挥终审",
            },
        };
        
        const reportPath = path.join(this.buildDir, 'review-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');
        
        // 文本报告
        const textReport = this.formatTextReport(report);
        const textReportPath = path.join(this.buildDir, 'review-report.txt');
        fs.writeFileSync(textReportPath, textReport, 'utf-8');
        
        console.log('\n📋 审核报告生成完成');
        console.log(`  JSON报告: ${reportPath}`);
        console.log(`  文本报告: ${textReportPath}`);
        
        // 输出审核结论
        console.log('\n========================================');
        console.log(overallPassed ? '✅ 审核专员二审通过' : '❌ 审核专员二审未通过');
        console.log('========================================');
        
        if (!overallPassed) {
            console.log('\n⚠️ 需要修复的问题:');
            for (const [category, result] of Object.entries(reviewResults)) {
                if (!result.passed && result.issues && result.issues.length > 0) {
                    console.log(`  ${category}: ${result.issues.join(', ')}`);
                }
            }
        }
        
        return report;
    }
    
    /**
     * 生成建议
     */
    generateRecommendations(reviewResults) {
        const recommendations = [];
        
        if (!reviewResults.compliance.passed) {
            recommendations.push("立即配置实际平台AppID（微信、抖音）");
            recommendations.push("验证质量门禁配置是否符合平台要求");
        }
        
        if (!reviewResults.buildScripts.passed) {
            recommendations.push("完善构建脚本，确保语法正确和功能完整");
        }
        
        if (!reviewResults.documentation.passed) {
            recommendations.push("补充缺失的文档内容，确保文档完整");
        }
        
        // 通用建议
        recommendations.push("在实际构建环境中测试构建脚本");
        recommendations.push("准备部署环境配置和权限设置");
        recommendations.push("制定应急回滚方案");
        
        return recommendations;
    }
    
    /**
     * 格式化文本报告
     */
    formatTextReport(report) {
        let text = `审核专员工作报告（二级验收）
========================================
项目: ${report.project}
审核时间: ${new Date(report.timestamp).toLocaleString('zh-CN')}
审核类型: ${report.reviewType}
总体结果: ${report.overallResult}

📊 审核统计
----------------------------------------
审核项总数: ${report.summary.totalItems}
通过项: ${report.summary.passedItems}
未通过项: ${report.summary.failedItems}

🔍 详细审核结果
----------------------------------------
`;
        
        for (const [category, result] of Object.entries(report.reviewDetails)) {
            const categoryName = category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            const status = result.passed ? '✅ 通过' : '❌ 未通过';
            text += `${categoryName}: ${status}\n`;
            
            if (!result.passed && result.issues && result.issues.length > 0) {
                text += `  问题: ${result.issues.join(', ')}\n`;
            }
            
            if (result.warnings && result.warnings.length > 0) {
                text += `  警告: ${result.warnings.join(', ')}\n`;
            }
        }
        
        text += `
💡 改进建议
----------------------------------------
${report.recommendations.map(rec => `• ${rec}`).join('\n')}

✅ 验收状态
----------------------------------------
岗位自检: ${report.verificationStatus.selfCheck}
审核专员二审: ${report.verificationStatus.reviewerCheck}
总指挥终审: ${report.verificationStatus.finalCheck}

========================================
报告生成完成
`;
        
        return text;
    }
    
    /**
     * 执行审核工作
     */
    async execute() {
        console.log('🚀 开始执行审核专员岗位工作（二级验收）\n');
        
        const { allPassed, reviewResults } = await this.reviewBuildEngineerWork();
        
        console.log('\n========================================');
        console.log(allPassed ? '✅ 审核专员岗位工作完成' : '❌ 审核专员岗位工作完成（有未通过项）');
        console.log('========================================');
        
        return allPassed;
    }
}

// 执行审核专员岗位
if (require.main === module) {
    const reviewer = new ReviewEngineer();
    reviewer.execute().then(passed => {
        process.exit(passed ? 0 : 1);
    }).catch(error => {
        console.error('审核专员岗位执行失败:', error);
        process.exit(1);
    });
}

module.exports = ReviewEngineer;