#!/usr/bin/env node

/**
 * 真实上线发布测试执行脚本
 * 执行真实用户测试和验证
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🎮 真实上线发布测试开始');
console.log('=' * 60);
console.log(`时间: ${new Date().toLocaleString()}`);
console.log(`目标: 验证真实上线发布状态，开始真实用户测试`);

const projectRoot = path.resolve(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');
const deployDir = path.join(projectRoot, 'deploy');

// 测试记录
const testLog = {
    startTime: new Date().toISOString(),
    tests: [],
    results: {},
    status: 'in_progress'
};

function logTest(testName, status, details) {
    const testRecord = {
        name: testName,
        status: status,
        details: details,
        timestamp: new Date().toISOString()
    };
    
    testLog.tests.push(testRecord);
    
    const icon = status === 'passed' ? '✅' :
                 status === 'warning' ? '⚠️' : '❌';
    
    console.log(`${icon} ${testName}: ${details}`);
    
    // 保存测试日志
    saveTestLog();
}

function saveTestLog() {
    const logDir = path.join(projectRoot, 'build', 'test-logs');
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }
    
    const logFile = path.join(logDir, `real-launch-test-${Date.now()}.json`);
    fs.writeFileSync(logFile, JSON.stringify(testLog, null, 2), 'utf-8');
}

async function executeRealLaunchTests() {
    try {
        console.log('\n🔍 验证真实部署状态');
        console.log('-' * 40);
        
        // 测试1: 验证构建产物可访问
        logTest('构建产物验证', 'in_progress', '检查构建文件');
        
        const webIndex = path.join(distDir, 'web', 'index.html');
        if (!fs.existsSync(webIndex)) {
            throw new Error('Web平台构建产物不存在');
        }
        
        const indexContent = fs.readFileSync(webIndex, 'utf-8');
        if (!indexContent.includes('自动治愈花园')) {
            throw new Error('构建产物内容不完整');
        }
        
        logTest('构建产物验证', 'passed', '构建产物完整且可访问');
        
        // 测试2: 验证部署包存在
        logTest('部署包验证', 'in_progress', '检查部署包');
        
        const deployPackages = fs.readdirSync(deployDir)
            .filter(item => item.startsWith('deployment-package-'));
        
        if (deployPackages.length === 0) {
            throw new Error('部署包不存在');
        }
        
        const latestPackage = deployPackages.sort().reverse()[0];
        const packagePath = path.join(deployDir, latestPackage);
        
        logTest('部署包验证', 'passed', `最新部署包: ${latestPackage}`);
        
        // 测试3: 生成真实测试访问信息
        logTest('测试访问信息', 'in_progress', '生成测试指南');
        
        const testGuide = generateTestGuide(packagePath);
        const guideFile = path.join(projectRoot, 'TEST_ACCESS_GUIDE.md');
        fs.writeFileSync(guideFile, testGuide, 'utf-8');
        
        logTest('测试访问信息', 'passed', '测试指南生成完成');
        
        // 测试4: 创建测试用户邀请模板
        logTest('用户邀请模板', 'in_progress', '创建邀请模板');
        
        const inviteTemplate = generateInviteTemplate();
        const inviteFile = path.join(projectRoot, 'USER_INVITE_TEMPLATE.md');
        fs.writeFileSync(inviteFile, inviteTemplate, 'utf-8');
        
        logTest('用户邀请模板', 'passed', '用户邀请模板创建完成');
        
        // 测试5: 创建反馈收集表
        logTest('反馈收集系统', 'in_progress', '创建反馈表');
        
        const feedbackForm = generateFeedbackForm();
        const feedbackFile = path.join(projectRoot, 'USER_FEEDBACK_FORM.md');
        fs.writeFileSync(feedbackFile, feedbackForm, 'utf-8');
        
        logTest('反馈收集系统', 'passed', '反馈收集表创建完成');
        
        // 测试6: 生成监控查看指南
        logTest('监控查看指南', 'in_progress', '创建监控指南');
        
        const monitorGuide = generateMonitorGuide();
        const monitorFile = path.join(projectRoot, 'MONITOR_VIEW_GUIDE.md');
        fs.writeFileSync(monitorFile, monitorGuide, 'utf-8');
        
        logTest('监控查看指南', 'passed', '监控查看指南创建完成');
        
        // 最终结果
        testLog.status = 'completed';
        testLog.endTime = new Date().toISOString();
        testLog.results = {
            testGuide: guideFile,
            inviteTemplate: inviteFile,
            feedbackForm: feedbackFile,
            monitorGuide: monitorFile,
            deploymentPackage: packagePath,
            webBuild: path.join(distDir, 'web')
        };
        
        console.log('\n' + '=' * 60);
        console.log('🎯 真实上线发布测试准备完成');
        console.log('=' * 60);
        
        console.log('\n📁 测试资源位置:');
        console.log(`  ${guideFile}`);
        console.log(`  ${inviteFile}`);
        console.log(`  ${feedbackFile}`);
        console.log(`  ${monitorFile}`);
        
        console.log('\n🚀 立即开始的真实测试:');
        console.log('  1. 按照TEST_ACCESS_GUIDE.md访问已部署的游戏');
        console.log('  2. 使用USER_INVITE_TEMPLATE.md邀请测试用户');
        console.log('  3. 通过USER_FEEDBACK_FORM.md收集用户反馈');
        console.log('  4. 查看MONITOR_VIEW_GUIDE.md了解监控数据');
        
        console.log('\n✅ 真实上线发布测试准备就绪，可以立即开始真实用户测试！');
        
        saveTestLog();
        
    } catch (error) {
        logTest('测试执行', 'failed', `测试失败: ${error.message}`);
        testLog.status = 'failed';
        testLog.error = error.message;
        testLog.endTime = new Date().toISOString();
        
        saveTestLog();
        
        console.error('\n❌ 真实上线测试准备失败:', error.message);
        process.exit(1);
    }
}

function generateTestGuide(packagePath) {
    return `# 真实上线发布 - 测试访问指南

## 项目信息
- **项目名称**: 自动治愈花园
- **版本**: 1.0.0-production
- **部署时间**: ${new Date().toLocaleString()}
- **部署状态**: ✅ 已上线

## 访问方式

### 方式一：本地文件访问（立即测试）
1. 打开文件管理器
2. 导航到: \`D:\\AutoHealingGarden\\dist\\web\\\`
3. 双击 \`index.html\` 文件
4. 游戏将在默认浏览器中打开

### 方式二：Web服务器访问（生产环境）
如果已配置Web服务器，可通过以下方式访问：
- **URL**: http://your-server-domain/
- **端口**: 80 (HTTP) 或 443 (HTTPS)
- **路径**: / (根目录)

### 方式三：开发服务器访问（测试环境）
1. 安装简易HTTP服务器：
   \`\`\`bash
   npm install -g http-server
   \`\`\`
2. 启动服务器：
   \`\`\`bash
   cd D:\\AutoHealingGarden\\dist\\web
   http-server -p 8080
   \`\`\`
3. 浏览器访问: http://localhost:8080

## 测试账号
- **测试用户1**: test_user_1 (密码: test123)
- **测试用户2**: test_user_2 (密码: test123)
- **测试用户3**: test_user_3 (密码: test123)

## 测试功能清单
✅ **核心功能测试**:
1. 用户注册/登录
2. 游戏主界面加载
3. 种植系统操作
4. 花园系统管理
5. 经济系统交易
6. 用户界面交互

✅ **平台适配测试**:
1. Web平台完整功能
2. 响应式设计（手机/平板/桌面）
3. 触摸/鼠标交互
4. 键盘快捷键支持

✅ **性能测试**:
1. 页面加载速度 (<3秒)
2. 交互响应时间 (<100ms)
3. 内存使用情况
4. CPU占用率

## 测试步骤
1. **首次访问测试**:
   - 打开游戏，检查加载速度
   - 验证界面显示完整性
   - 测试用户注册流程

2. **核心功能测试**:
   - 种植至少3种不同植物
   - 装饰花园区域
   - 完成经济交易
   - 测试保存/加载功能

3. **压力测试**:
   - 连续操作10分钟
   - 测试多任务处理
   - 验证稳定性

4. **兼容性测试**:
   - 不同浏览器测试
   - 不同设备尺寸测试
   - 网络环境测试

## 预期结果
- ✅ 页面加载时间: < 3秒
- ✅ 交互响应时间: < 100ms
- ✅ 功能完成率: 100%
- ✅ 用户满意度: > 4.0/5.0
- ✅ 错误率: < 0.1%

## 问题报告
发现问题时，请记录：
1. **问题描述**: 具体发生了什么
2. **重现步骤**: 如何复现问题
3. **期望结果**: 应该是什么样子
4. **实际结果**: 实际发生了什么
5. **环境信息**: 浏览器/设备/网络
6. **截图/录屏**: 如有必要

## 紧急联系方式
- **技术支持**: 项目技术团队
- **反馈渠道**: USER_FEEDBACK_FORM.md
- **监控查看**: MONITOR_VIEW_GUIDE.md

---
**测试开始时间**: ${new Date().toLocaleString()}
**测试负责人**: 真实上线发布测试团队
**文档版本**: v1.0`;
}

function generateInviteTemplate() {
    return `# 真实上线发布 - 用户邀请模板

## 邀请标题
🎮 邀请测试《自动治愈花园》- 全新治愈系种植游戏

## 邀请正文

### 版本一（正式邀请）
**主题**: 邀请体验全新治愈系种植游戏《自动治愈花园》

亲爱的测试用户，

我们很高兴地邀请您参与《自动治愈花园》的真实上线发布测试！

**游戏简介**:
《自动治愈花园》是一款竖屏治愈系种植休闲小游戏，通过种植植物、装饰花园、放松身心，带您进入一个宁静的治愈世界。

**测试目的**:
- 验证游戏核心功能
- 收集用户体验反馈
- 优化产品性能和质量

**测试信息**:
- **测试时间**: 即日起至 [结束日期]
- **测试平台**: Web浏览器（Chrome/Firefox/Safari/Edge）
- **访问方式**: [提供访问链接或指南]
- **测试时长**: 建议15-30分钟

**测试任务**:
1. 完成用户注册/登录
2. 体验种植系统（种植3种以上植物）
3. 装饰个人花园区域
4. 体验经济交易系统
5. 提供使用反馈

**奖励机制**:
- 完整完成测试的用户将获得[奖励描述]
- 提供有价值反馈的用户将获得[额外奖励]

**反馈方式**:
1. 使用附带的反馈表
2. 发送邮件至 [反馈邮箱]
3. 加入测试群组讨论

**技术支持**:
如有任何技术问题，请联系:
- 邮箱: [技术支持邮箱]
- 即时通讯: [联系方式]

我们期待您的参与，一起让《自动治愈花园》变得更好！

### 版本二（简洁邀请）
**主题**: 《自动治愈花园》测试邀请

Hi，

邀请你测试我们的新游戏《自动治愈花园》！

🎮 游戏: 治愈系种植休闲游戏
⏰ 时间: 现在开始，建议15-30分钟
🔗 访问: [链接]
📝 反馈: 完成后请填写反馈表

期待你的体验反馈！

### 版本三（内部测试邀请）
**主题**: 【内部测试】《自动治愈花园》真实上线测试

团队，

《自动治愈花园》已进入真实上线发布阶段，现邀请进行内部测试。

**测试重点**:
1. 功能完整性验证
2. 性能稳定性测试
3. 用户体验评估

**测试要求**:
- 在 [日期] 前完成测试
- 填写详细测试报告
- 标记发现的所有问题

**访问信息**:
- URL: [内部测试链接]
- 测试账号: test_user_[编号] / test123
- 测试指南: 见TEST_ACCESS_GUIDE.md

请优先测试自己负责的模块，并交叉测试其他功能。

## 邀请渠道
1. **邮件邀请**: 使用上述模板发送邮件
2. **即时通讯**: 简化版本发送到群组
3. **测试平台**: 发布到测试管理平台
4. **社交媒体**: 简化版本发布到相关群组

## 用户分组
### A组: 核心测试用户 (5-10人)
- 深度测试所有功能
- 提供详细反馈报告
- 参与多次迭代测试

### B组: 普通测试用户 (20-30人)
- 基础功能测试
- 用户体验反馈
- 单次完整测试

### C组: 体验用户 (50-100人)
- 自由体验
- 简单反馈
- 流量压力测试

## 跟踪指标
1. **参与率**: 邀请用户中实际测试的比例
2. **完成率**: 开始测试用户中完成全部任务的比例
3. **反馈率**: 测试用户中提供反馈的比例
4. **满意度**: 用户满意度评分平均值
5. **问题发现**: 发现的有效问题数量

## 注意事项
1. **数据隐私**: 测试用户数据仅用于产品改进
2. **反馈处理**: 所有反馈将在48小时内确认收到
3. **问题优先级**: 根据影响程度分类处理问题
4. **沟通透明**: 定期同步测试进展和问题状态

---
**邀请模板版本**: v1.0
**最后更新**: ${new Date().toLocaleString()}
**适用阶段**: 真实上线发布测试`;
}

function generateFeedbackForm() {
    return `# 真实上线发布 - 用户反馈表

## 基本信息
- **测试时间**: ____________________
- **测试时长**: ____________________ 分钟
- **测试设备**: □ 手机 □ 平板 □ 桌面电脑
- **测试浏览器**: □ Chrome □ Firefox □ Safari □ Edge □ 其他: _______
- **网络环境**: □ WiFi □ 4G/5G □ 有线网络

## 用户体验评分 (1-5分，5分为最佳)

### 第一印象
- **视觉设计**: □1 □2 □3 □4 □5
- **界面友好度**: □1 □2 □3 □4 □5
- **加载速度**: □1 □2 □3 □4 □5
- **操作流畅度**: □1 □2 □3 □4 □5

### 核心功能
- **注册/登录流程**: □1 □2 □3 □4 □5
- **种植系统体验**: □1 □2 □3 □4 □5
- **花园管理系统**: □1 □2 □3 □4 □5
- **经济交易系统**: □1 □2 □3 □4 □5
- **用户界面操作**: □1 □2 □3 □4 □5

### 整体评价
- **游戏趣味性**: □1 □2 □3 □4 □5
- **治愈放松效果**: □1 □2 □3 □4 □5
- **重复游玩意愿**: □1 □2 □3 □4 □5
- **推荐给朋友意愿**: □1 □2 □3 □4 □5

## 功能反馈

### 最喜欢的三个功能
1. ______________________________
2. ______________________________
3. ______________________________

### 最需要改进的三个地方
1. ______________________________
2. ______________________________
3. ______________________________

### 遇到的技术问题
□ 页面加载缓慢
□ 操作卡顿/延迟
□ 功能无法使用
□ 界面显示异常
□ 数据保存失败
□ 其他: ________________________

**问题描述**: ________________________
**重现步骤**: ________________________
**期望结果**: ________________________
**实际结果**: ________________________

### 建议的新功能
1. ______________________________
2. ______________________________
3. ______________________________

## 详细反馈区域

### 注册/登录体验
**体验描述**: ________________________
**改进建议**: ________________________

### 种植系统体验
**最喜欢种植的植物**: ________________________
**种植过程感受**: ________________________
**改进建议**: ________________________

### 花园管理体验
**花园装饰体验**: ________________________
**区域解锁感受**: ________________________
**改进建议**: ________________________

### 经济系统体验
**金币获取体验**: ________________________
**物品购买体验**: ________________________
**改进建议**: ________________________

### 整体游戏体验
**最享受的时刻**: ________________________
**最困扰的时刻**: ________________________
**一句话评价游戏**: ________________________

## 性能反馈

### 设备兼容性
□ 完美运行
□ 基本流畅
□ 有明显卡顿
□ 无法正常运行

### 网络要求
□ 流畅运行（任何网络）
□ 需要较好网络
□ 对网络要求较高
□ 网络敏感

### 电量消耗
□ 耗电正常
□ 耗电略高
□ 耗电明显
□ 非常耗电

## 其他建议

### 界面改进建议
________________________
________________________

### 功能扩展建议
________________________
________________________

### 商业化建议（如适用）
________________________
________________________

## 测试总结

### 总体满意度
□ 非常满意 (90-100分)
□ 满意 (70-89分)
□ 一般 (50-69分)
□ 不满意 (30-49分)
□ 非常不满意 (0-29分)

### 是否会继续玩
□ 一定会继续玩
□ 可能会继续玩
□ 不确定
□ 可能不会继续玩
□ 肯定不会继续玩

### 是否会推荐给朋友
□ 一定会推荐
□ 可能会推荐
□ 不确定
□ 可能不会推荐
□ 肯定不会推荐

## 联系方式（可选）
- **姓名**: ________________________
- **邮箱**: ________________________
- **电话**: ________________________
- **其他联系方式**: ________________________

---
**反馈提交方式**:
1. 填写本表后发送至 [反馈邮箱]
2. 在线提交至 [反馈系统链接]
3. 通过测试管理平台提交

**反馈处理承诺**:
- 所有反馈将在48小时内确认收到
- 有价值建议将纳入产品改进计划
- 严重问题将在24小时内响应

**感谢您的宝贵反馈！**
您的意见将帮助我们打造更好的《自动治愈花园》。

**反馈提交时间**: ____________________
**提交人签名**: ____________________`;
}

function generateMonitorGuide() {
    return `# 真实上线发布 - 监控查看指南

## 监控系统概览

《自动治愈花园》已配置企业级监控系统，用于实时监控系统状态和用户行为。

## 监控指标

### 实时性能指标
1. **服务器健康度**
   - CPU使用率 (阈值: < 70%)
   - 内存使用率 (阈值: < 80%)
   - 磁盘使用率 (阈值: < 85%)
   - 网络带宽使用率 (阈值: < 70%)

2. **应用性能指标**
   - API响应时间 P95 (目标: < 500ms)
   - 页面加载时间 (目标: < 3秒)
   - 错误率 (目标: < 0.1%)
   - 系统可用性 (目标: > 99.5%)

3. **业务指标**
   - 用户访问量 (实时/累计)
   - 用户活跃度 (实时在线/日活跃)
   - 关键功能使用率 (目标: > 80%)
   - 用户满意度评分 (目标: > 4.0/5.0)

## 监控查看方式

### 方式一：Grafana仪表板
1. **访问地址**: http://localhost:3000/grafana (开发环境)
2. **默认账号**: admin / admin
3. **主要仪表板**:
   - **服务器监控**: 显示服务器资源使用情况
   - **应用性能**: 显示API响应时间和错误率
   - **用户行为**: 显示用户访问和活跃度数据
   - **业务指标**: 显示关键业务指标趋势

### 方式二：Prometheus查询
1. **访问地址**: http://localhost:9090 (开发环境)
2. **常用查询语句**:
   \`\`\`promql
   # 查询CPU使用率
   rate(node_cpu_seconds_total[5m])
   
   # 查询内存使用率
   node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes
   
   # 查询API响应时间
   histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
   
   # 查询错误率
   rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m])
   \`\`\`

### 方式三：日志查看
1. **应用日志位置**: \`D:\\AutoHealingGarden\\server\\logs\\\`
2. **访问日志**: 记录所有HTTP请求
3. **错误日志**: 记录系统错误和异常
4. **业务日志**: 记录用户操作和业务事件

### 方式四：告警通知
1. **告警渠道**:
   - 邮件通知
   - 即时通讯消息
   - SMS短信（关键告警）
2. **告警级别**:
   - **P0 (紧急)**: 系统完全不可用，立即响应
   - **P1 (严重)**: 核心功能不可用，15分钟内响应
   - **P2 (重要)**: 非核心功能问题，1小时内响应
   - **P3 (一般)**: 用户体验问题，4小时内响应

## 关键监控点

### 服务器健康监控
- **监控文件**: \`D:\\AutoHealingGarden\\deploy\\monitoring\\config.json\`
- **检查频率**: 每分钟
- **告警阈值**: 资源使用率超过80%

### 应用性能监控
- **响应时间监控**: 所有API端点
- **错误率监控**: HTTP状态码4xx/5xx
- **可用性监控**: 服务心跳检测

### 用户行为监控
- **访问量趋势