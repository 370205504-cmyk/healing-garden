#!/usr/bin/env node

/**
 * 继续推进真实上线发布
 * 简化的下一步行动执行器
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 继续推进真实上线发布');
console.log('=' * 60);
console.log(`时间: ${new Date().toLocaleString()}`);
console.log(`项目: 自动治愈花园 v1.0.0-production`);

const projectRoot = path.resolve(__dirname, '..');
const dataDir = path.join(projectRoot, 'data', 'real-launch');

// 确保目录存在
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// 分析当前状态
function analyzeCurrentState() {
    console.log('\n🔍 分析当前状态...');
    
    const state = {
        build: checkBuildStatus(),
        users: checkUserStatus(),
        feedback: checkFeedbackStatus(),
        deployment: checkDeploymentStatus()
    };
    
    return state;
}

function checkBuildStatus() {
    const webDir = path.join(projectRoot, 'dist', 'web');
    
    if (!fs.existsSync(webDir)) {
        return { status: 'missing', message: '构建产物不存在' };
    }
    
    const files = fs.readdirSync(webDir);
    const hasIndex = files.includes('index.html');
    const hasMainJs = files.includes('main.js');
    
    if (!hasIndex || !hasMainJs) {
        return { status: 'incomplete', message: '构建产物不完整' };
    }
    
    return { 
        status: 'ready', 
        message: `构建产物就绪 (${files.length}个文件)`,
        files: files
    };
}

function checkUserStatus() {
    const userFile = path.join(dataDir, 'test-users.json');
    
    if (!fs.existsSync(userFile)) {
        return { status: 'none', message: '暂无测试用户', count: 0 };
    }
    
    try {
        const data = JSON.parse(fs.readFileSync(userFile, 'utf-8'));
        const users = data.users || [];
        const invited = users.filter(u => u.invited).length;
        const tested = users.filter(u => u.tested).length;
        
        return {
            status: users.length > 0 ? 'has_users' : 'none',
            message: `${users.length}名用户 (${invited}已邀请, ${tested}已测试)`,
            count: users.length,
            invited: invited,
            tested: tested
        };
    } catch (e) {
        return { status: 'error', message: '用户数据错误', count: 0 };
    }
}

function checkFeedbackStatus() {
    const feedbackFile = path.join(dataDir, 'feedback.json');
    
    if (!fs.existsSync(feedbackFile)) {
        return { status: 'none', message: '暂无用户反馈', count: 0 };
    }
    
    try {
        const data = JSON.parse(fs.readFileSync(feedbackFile, 'utf-8'));
        const feedbacks = data.feedbacks || [];
        
        if (feedbacks.length === 0) {
            return { status: 'none', message: '暂无用户反馈', count: 0 };
        }
        
        const totalRating = feedbacks.reduce((sum, fb) => sum + (fb.overallRating || 0), 0);
        const avgRating = feedbacks.length > 0 ? (totalRating / feedbacks.length).toFixed(1) : 0;
        
        return {
            status: 'has_feedback',
            message: `${feedbacks.length}条反馈 (平均${avgRating}/5.0)`,
            count: feedbacks.length,
            avgRating: avgRating
        };
    } catch (e) {
        return { status: 'error', message: '反馈数据错误', count: 0 };
    }
}

function checkDeploymentStatus() {
    const deployDir = path.join(projectRoot, 'deploy');
    
    if (!fs.existsSync(deployDir)) {
        return { status: 'none', message: '无部署包' };
    }
    
    const packages = fs.readdirSync(deployDir)
        .filter(item => item.startsWith('deployment-package-'));
    
    if (packages.length === 0) {
        return { status: 'none', message: '无部署包' };
    }
    
    return {
        status: 'deployed',
        message: `${packages.length}个部署包`,
        packages: packages
    };
}

// 推荐下一步行动
function recommendNextAction(state) {
    console.log('\n🎯 状态分析结果:');
    console.log('-'.repeat(40));
    console.log(`🏗️ 构建: ${state.build.message}`);
    console.log(`👥 用户: ${state.users.message}`);
    console.log(`📝 反馈: ${state.feedback.message}`);
    console.log(`🚀 部署: ${state.deployment.message}`);
    
    console.log('\n💡 推荐下一步行动:');
    
    const recommendations = [];
    
    // 检查构建状态
    if (state.build.status !== 'ready') {
        recommendations.push({
            priority: '紧急',
            action: '修复构建问题',
            reason: '构建产物是测试的基础',
            command: '检查 D:\\AutoHealingGarden\\dist\\web\\ 目录'
        });
    }
    
    // 检查用户状态
    if (state.users.count < 5) {
        recommendations.push({
            priority: '高',
            action: '添加测试用户',
            reason: '需要至少5名测试用户开始有效测试',
            command: 'node scripts/real-launch-manager.js'
        });
    } else if (state.users.invited < state.users.count * 0.5) {
        recommendations.push({
            priority: '中',
            action: '邀请更多用户测试',
            reason: '只有部分用户被邀请测试',
            command: 'node scripts/real-launch-manager.js 然后选择"发送邀请"'
        });
    }
    
    // 检查反馈状态
    if (state.feedback.count < 3) {
        recommendations.push({
            priority: '高',
            action: '收集用户反馈',
            reason: '需要用户反馈来优化产品',
            command: '使用 docs/real-launch/feedback-form.md 收集反馈'
        });
    } else if (state.feedback.avgRating < 4.0) {
        recommendations.push({
            priority: '中',
            action: '分析并优化产品',
            reason: '用户评分较低，需要改进',
            command: 'node scripts/real-launch-manager.js 然后选择"分析反馈数据"'
        });
    }
    
    // 如果所有条件都满足，推荐灰度发布
    if (state.build.status === 'ready' && 
        state.users.count >= 5 && 
        state.users.tested >= 3 &&
        state.feedback.count >= 3 &&
        state.feedback.avgRating >= 4.0) {
        recommendations.push({
            priority: '高',
            action: '开始灰度发布',
            reason: '条件成熟，可以开始扩大用户范围',
            command: 'node scripts/real-launch-manager.js 然后选择"控制灰度发布"'
        });
    }
    
    // 如果没有推荐，添加基础推荐
    if (recommendations.length === 0) {
        recommendations.push({
            priority: '中',
            action: '扩大测试范围',
            reason: '当前状态良好，可以邀请更多用户',
            command: '邀请更多用户参与测试'
        });
    }
    
    // 按优先级排序
    const priorityOrder = { '紧急': 0, '高': 1, '中': 2, '低': 3 };
    recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    
    return recommendations;
}

// 执行推荐行动
function executeRecommendedAction(recommendation) {
    console.log('\n🚀 执行推荐行动:');
    console.log('=' * 40);
    console.log(`行动: ${recommendation.action}`);
    console.log(`优先级: ${recommendation.priority}`);
    console.log(`理由: ${recommendation.reason}`);
    console.log(`命令: ${recommendation.command}`);
    
    // 根据行动类型执行不同的操作
    switch (recommendation.action) {
        case '添加测试用户':
            addSampleUsers();
            break;
            
        case '收集用户反馈':
            showFeedbackInstructions();
            break;
            
        case '开始灰度发布':
            startGrayRelease();
            break;
            
        default:
            console.log(`\n请手动执行: ${recommendation.command}`);
            break;
    }
}

function addSampleUsers() {
    console.log('\n👥 自动添加测试用户...');
    
    const userFile = path.join(dataDir, 'test-users.json');
    let usersData = { users: [] };
    
    if (fs.existsSync(userFile)) {
        try {
            usersData = JSON.parse(fs.readFileSync(userFile, 'utf-8'));
        } catch (e) {
            console.log('⚠️ 读取用户数据失败，创建新文件');
        }
    }
    
    // 添加5个示例用户
    const sampleUsers = [
        { name: '内部测试员1', email: 'tester1@example.com', group: 'A' },
        { name: '内部测试员2', email: 'tester2@example.com', group: 'A' },
        { name: '普通用户1', email: 'user1@example.com', group: 'B' },
        { name: '普通用户2', email: 'user2@example.com', group: 'B' },
        { name: '体验用户1', email: 'visitor1@example.com', group: 'C' }
    ];
    
    let addedCount = 0;
    sampleUsers.forEach(sample => {
        // 检查是否已存在
        const exists = usersData.users.some(u => u.email === sample.email);
        if (!exists) {
            const user = {
                id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
                name: sample.name,
                email: sample.email,
                phone: '',
                group: sample.group,
                addedAt: new Date().toISOString(),
                invited: true, // 自动标记为已邀请
                invitedAt: new Date().toISOString(),
                tested: false,
                feedback: false
            };
            usersData.users.push(user);
            addedCount++;
            console.log(`✅ 添加: ${user.name} (${user.group}组)`);
        }
    });
    
    fs.writeFileSync(userFile, JSON.stringify(usersData, null, 2), 'utf-8');
    
    console.log(`\n🎉 成功添加 ${addedCount} 名测试用户`);
    console.log('📧 用户已自动标记为"已邀请"');
    console.log('📁 用户数据保存位置:', userFile);
    
    // 生成邀请文件
    generateInvitationFiles(usersData.users);
}

function generateInvitationFiles(users) {
    const inviteDir = path.join(dataDir, 'invitations');
    if (!fs.existsSync(inviteDir)) {
        fs.mkdirSync(inviteDir, { recursive: true });
    }
    
    const templateFile = path.join(projectRoot, 'docs', 'real-launch', 'invite-template.md');
    if (!fs.existsSync(templateFile)) {
        console.log('⚠️ 邀请模板文件不存在');
        return;
    }
    
    const template = fs.readFileSync(templateFile, 'utf-8');
    
    users.forEach(user => {
        const personalized = template
            .replace(/\[用户姓名\]/g, user.name)
            .replace(/\[用户邮箱\]/g, user.email)
            .replace(/\[邀请时间\]/g, new Date(user.invitedAt).toLocaleString());
        
        const inviteFile = path.join(inviteDir, `invite-${user.id}.md`);
        fs.writeFileSync(inviteFile, personalized, 'utf-8');
    });
    
    console.log(`📧 已为 ${users.length} 名用户生成邀请文件`);
    console.log(`📁 邀请文件位置: ${inviteDir}`);
}

function showFeedbackInstructions() {
    console.log('\n📝 收集用户反馈指南:');
    console.log('=' * 40);
    
    const feedbackFormPath = path.join(projectRoot, 'docs', 'real-launch', 'feedback-form.md');
    
    if (fs.existsSync(feedbackFormPath)) {
        console.log('1. 使用反馈表收集用户反馈:');
        console.log(`   文件位置: ${feedbackFormPath}`);
        console.log('   可以打印或发送给测试用户填写');
    }
    
    console.log('\n2. 手动添加反馈数据:');
    console.log('   运行: node scripts/real-launch-manager.js');
    console.log('   选择: 3. 收集用户反馈 → 2. 添加新反馈');
    
    console.log('\n3. 自动收集反馈:');
    console.log('   - 邀请用户测试游戏');
    console.log('   - 请求用户提供评分和意见');
    console.log('   - 记录用户遇到的问题');
    console.log('   - 汇总分析反馈数据');
    
    console.log('\n🎯 目标: 收集至少5份有效反馈，平均评分>4.0');
}

function startGrayRelease() {
    console.log('\n🚀 开始灰度发布流程:');
    console.log('=' * 40);
    
    const grayFile = path.join(dataDir, 'gray-release.json');
    let grayData = { 
        stages: [],
        currentStage: 0,
        startedAt: null,
        completedAt: null
    };
    
    if (fs.existsSync(grayFile)) {
        try {
            grayData = JSON.parse(fs.readFileSync(grayFile, 'utf-8'));
        } catch (e) {
            console.log('⚠️ 读取灰度发布数据失败，使用默认配置');
        }
    }
    
    if (grayData.currentStage === 0) {
        // 开始第一阶段
        const firstStage = {
            name: '内部测试',
            percentage: 5,
            startedAt: new Date().toISOString(),
            status: 'in_progress',
            description: '团队内部和核心用户测试'
        };
        
        grayData.stages.push(firstStage);
        grayData.currentStage = 1;
        grayData.startedAt = new Date().toISOString();
        
        fs.writeFileSync(grayFile, JSON.stringify(grayData, null, 2), 'utf-8');
        
        console.log('✅ 已开始第一阶段灰度发布');
        console.log(`阶段: ${firstStage.name}`);
        console.log(`目标用户: ${firstStage.percentage}%`);
        console.log(`开始时间: ${new Date(firstStage.startedAt).toLocaleString()}`);
        console.log(`描述: ${firstStage.description}`);
        
        // 生成阶段报告
        const reportDir = path.join(projectRoot, 'build', 'gray-release-reports');
        if (!fs.existsSync(reportDir)) {
            fs.mkdirSync(reportDir, { recursive: true });
        }
        
        const report = {
            stage: firstStage.name,
            startedAt: firstStage.startedAt,
            status: 'started',
            metrics: {
                targetUsers: '核心测试用户',
                successCriteria: '用户满意度 >4.0，错误率 <1%',
                duration: '1-2天'
            }
        };
        
        const reportFile = path.join(reportDir, `stage-1-${Date.now()}.json`);
        fs.writeFileSync(reportFile, JSON.stringify(report, null, 2), 'utf-8');
        
        console.log(`📊 阶段报告: ${reportFile}`);
        
    } else {
        console.log('灰度发布已在进行中');
        console.log(`当前阶段: ${grayData.currentStage}`);
        console.log(`开始时间: ${grayData.startedAt ? new Date(grayData.startedAt).toLocaleString() : '未知'}`);
    }
    
    console.log('\n📋 灰度发布计划:');
    console.log('1. 内部测试 (5%) - 1-2天');
    console.log('2. 核心用户 (10%) - 1-2天');
    console.log('3. 小范围发布 (25%) - 2-3天');
    console.log('4. 中等范围 (50%) - 3-5天');
    console.log('5. 全量发布 (100%) - 持续');
    
    console.log('\n🎯 成功标准:');
    console.log('- 用户满意度 >4.0/5.0');
    console.log('- 系统错误率 <1%');
    console.log('- 功能使用率 >80%');
}

// 生成进度报告
function generateProgressReport(state, recommendations) {
    console.log('\n📋 生成进度报告...');
    
    const reportDir = path.join(projectRoot, 'build', 'progress-reports');
    if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportFile = path.join(reportDir, `continue-progress-${timestamp}.md`);
    
    let report = `# 真实上线发布 - 继续推进报告

## 报告信息
- **生成时间**: ${new Date().toLocaleString()}
- **报告类型**: 继续推进分析
- **项目版本**: 1.0.0-production

## 当前状态分析

### 构建状态
- 状态: ${state.build.message}
- 详情: ${state.build.status === 'ready' ? '构建产物完整，可立即使用' : '需要检查构建问题'}

### 用户状态  
- 状态: ${state.users.message}
- 详情: ${state.users.count > 0 ? '已有测试用户基础' : '需要添加测试用户'}

### 反馈状态
- 状态: ${state.feedback.message}
- 详情: ${state.feedback.count > 0 ? '已开始收集用户反馈' : '需要收集用户反馈'}

### 部署状态
- 状态: ${state.deployment.message}
- 详情: ${state.deployment.status === 'deployed' ? '部署包已生成' : '部署状态正常'}

## 推荐行动

### 优先级排序
`;

    recommendations.forEach((rec, index) => {
        report += `${index + 1}. **${rec.priority}优先级**: ${rec.action}\n`;
        report += `   理由: ${rec.reason}\n`;
        report += `   执行: ${rec.command}\n\n`;
    });

    report += `## 下一步计划

### 立即执行
1. ${recommendations[0].action}
2. 验证执行效果
3. 更新项目状态

### 短期目标 (1-3天)
1. 建立稳定的测试用户群体 (10+用户)
2. 收集有效的用户反馈 (5+反馈，评分>4.0)
3. 完成第一阶段灰度发布

### 中期目标 (3-7天)
1. 基于反馈优化产品
2. 扩大灰度发布范围
3. 建立持续改进流程

## 风险与挑战

### 技术风险
- 构建产物完整性需要持续验证
- 多平台兼容性需要更多测试
- 性能监控需要持续关注

### 业务风险  
- 用户参与度可能不足
- 反馈质量参差不齐
- 产品优化方向需要数据支持

### 缓解措施
1. 建立自动化构建和测试流程
2. 设计激励机制提高用户参与度
3. 建立数据驱动的决策机制

## 成功标准

### 技术标准
- ✅ 构建产物完整可用
- ✅ 监控系统正常运行
- ✅ 错误率 <1%
- ✅ 响应时间 <500ms

### 业务标准
- 👥 测试用户 >10人
- 📝 有效反馈 >5份
- ⭐ 用户满意度 >4.0/5.0
- 🔄 灰度发布按计划推进

## 总结
当前项目状态${state.build.status === 'ready' && state.users.count >= 3 ? '良好' : '需要改进'}，建议${recommendations[0].priority}优先执行**${recommendations[0].action}**。

项目已进入真实上线发布阶段，需要重点关注用户测试和反馈收集，为灰度发布和产品优化提供数据支持。

---
**报告生成**: 继续推进脚本 v1.0
**分析时间**: ${new Date().toLocaleString()}
**建议执行**: ${recommendations[0].action}
`;

    fs.writeFileSync(reportFile, report, 'utf-8');
    
    console.log(`✅ 进度报告已生成: ${reportFile}`);
    console.log(`📄 报告摘要已保存，包含详细分析和建议`);
    
    return reportFile;
}

// 主执行流程
async function main() {
    try {
        // 1. 分析当前状态
        const state = analyzeCurrentState();
        
        // 2. 推荐下一步行动
        const recommendations = recommendNextAction(state);
        
        // 3. 显示推荐并询问是否执行
        console.log('\n' + '=' * 60);
        
        if (recommendations.length > 0) {
            const topRecommendation = recommendations[0];
            
            console.log(`\n🎯 最高优先级行动: ${topRecommendation.action}`);
            console.log(`优先级: ${topRecommendation.priority}`);
            console.log(`理由: ${topRecommendation.reason}`);
            
            // 询问是否执行
            const readline = require('readline');
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            
            rl.question(`\n是否立即执行此行动？(y/N): `, (answer) => {
                if (answer.toLowerCase() === 'y') {
                    console.log('\n' + '=' * 60);
                    executeRecommendedAction(topRecommendation);
                    
                    // 生成进度报告
                    const reportFile = generateProgressReport(state, recommendations);
                    
                    console.log('\n' + '=' * 60);
                    console.log('🎉 继续推进执行完成！');
                    console.log(`📋 详细报告: ${reportFile}`);
                    console.log(`🚀 下一步: 检查执行结果，继续推进`);
                } else {
                    console.log('\n⏸️ 已取消自动执行');
                    console.log('💡 请手动执行推荐行动或使用完整管理器');
                    console.log('完整管理器: node scripts/real-launch-manager.js');
                    
                    // 仍然生成报告
                    generateProgressReport(state, recommendations);
                }
                
                rl.close();
                console.log('\n🏁 脚本执行完成');
            });
        } else {
            console.log('暂无推荐行动，项目状态可能需要检查');
            generateProgressReport(state, []);
            console.log('\n🏁 脚本执行完成');
        }
        
    } catch (error) {
        console.error('❌ 执行出错:', error.message);
        console.error('详细错误:', error.stack);
        process.exit(1);
    }
}

// 执行主函数
main();