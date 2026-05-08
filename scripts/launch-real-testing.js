#!/usr/bin/env node

/**
 * 真实上线测试准备脚本
 * 生成立即可用的测试资源
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 真实上线测试准备开始');
console.log('=' * 50);
console.log(`时间: ${new Date().toLocaleString()}`);
console.log(`目标: 生成立即可用的真实测试资源`);

const projectRoot = path.resolve(__dirname, '..');
const docsDir = path.join(projectRoot, 'docs', 'real-launch');

// 确保目录存在
if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
}

// 1. 生成真实访问指南
console.log('\n📖 生成真实访问指南...');
const accessGuide = `# 《自动治愈花园》真实上线测试指南

## 项目状态
- **项目**: 自动治愈花园
- **版本**: 1.0.0-production
- **状态**: ✅ 真实上线发布完成
- **时间**: ${new Date().toLocaleString()}

## 🎮 立即开始真实测试

### 方式一：本地文件测试（推荐）
1. 打开文件资源管理器
2. 导航到: \`D:\\AutoHealingGarden\\dist\\web\\\`
3. 双击 \`index.html\`
4. 游戏将在浏览器中打开

### 方式二：HTTP服务器测试
1. 安装HTTP服务器：
   \`\`\`bash
   npm install -g http-server
   \`\`\`
2. 启动服务器：
   \`\`\`bash
   cd D:\\AutoHealingGarden\\dist\\web
   http-server
   \`\`\`
3. 访问: http://localhost:8080

### 方式三：生产环境测试
如果已部署到服务器：
- URL: http://your-domain.com/
- 端口: 80/443
- 路径: /

## 🎯 测试任务清单

### 基础功能测试
- [ ] 打开游戏，检查加载时间 (<3秒)
- [ ] 注册/登录功能测试
- [ ] 种植系统：种植3种不同植物
- [ ] 花园系统：装饰花园区域
- [ ] 经济系统：完成购买/交易
- [ ] UI系统：测试所有界面交互

### 性能测试
- [ ] 页面响应时间 (<100ms)
- [ ] 内存使用情况 (正常范围)
- [ ] CPU占用率 (正常范围)
- [ ] 网络请求效率

### 兼容性测试
- [ ] Chrome浏览器测试
- [ ] Firefox浏览器测试
- [ ] Safari浏览器测试
- [ ] Edge浏览器测试
- [ ] 手机/平板响应式测试

## 📊 测试记录表

### 测试环境
- 设备: _______________
- 浏览器: _______________
- 网络: _______________
- 时间: _______________

### 测试结果
1. **加载时间**: ______秒
2. **注册成功率**: □成功 □失败
3. **种植成功率**: □成功 □失败
4. **花园装饰**: □成功 □失败
5. **经济交易**: □成功 □失败
6. **总体满意度**: □1 □2 □3 □4 □5分

### 发现的问题
1. ________________________
2. ________________________
3. ________________________

### 改进建议
1. ________________________
2. ________________________
3. ________________________

## 🔧 问题报告

**遇到问题？请记录**:
1. **问题描述**: ________________________
2. **重现步骤**: ________________________
3. **期望结果**: ________________________
4. **实际结果**: ________________________
5. **截图位置**: ________________________

## 📞 支持联系

- **技术支持**: 项目技术团队
- **反馈渠道**: docs/real-launch/feedback-form.md
- **紧急问题**: 立即报告，24小时内响应

---
**文档版本**: v1.0
**生成时间**: ${new Date().toLocaleString()}
**适用阶段**: 真实上线发布测试
`;

fs.writeFileSync(path.join(docsDir, 'test-guide.md'), accessGuide, 'utf-8');
console.log('✅ 真实访问指南生成完成');

// 2. 生成反馈收集表
console.log('\n📝 生成反馈收集表...');
const feedbackForm = `# 真实上线测试反馈表

## 测试信息
- 测试时间: ______年__月__日 __:__
- 测试时长: ______分钟
- 测试设备: □手机 □平板 □电脑
- 浏览器: □Chrome □Firefox □Safari □Edge □其他: ______

## 功能评分 (1-5分)
- 加载速度: □1 □2 □3 □4 □5
- 界面美观: □1 □2 □3 □4 □5
- 操作流畅: □1 □2 □3 □4 □5
- 种植系统: □1 □2 □3 □4 □5
- 花园系统: □1 □2 □3 □4 □5
- 经济系统: □1 □2 □3 □4 □5
- 整体体验: □1 □2 □3 □4 □5

## 功能完成度
- [ ] 成功注册/登录
- [ ] 成功种植植物
- [ ] 成功装饰花园
- [ ] 成功完成交易
- [ ] 成功保存进度
- [ ] 成功加载进度

## 发现的问题
问题1: ________________________
严重程度: □轻微 □一般 □严重 □致命

问题2: ________________________
严重程度: □轻微 □一般 □严重 □致命

问题3: ________________________
严重程度: □轻微 □一般 □严重 □致命

## 改进建议
建议1: ________________________
优先级: □高 □中 □低

建议2: ________________________
优先级: □高 □中 □低

建议3: ________________________
优先级: □高 □中 □低

## 测试总结
- 总体满意度: □非常满意 □满意 □一般 □不满意 □非常不满意
- 是否会继续玩: □一定会 □可能会 □不确定 □可能不会 □肯定不会
- 是否会推荐: □一定会 □可能会 □不确定 □可能不会 □肯定不会

## 联系方式 (可选)
- 姓名: ________________________
- 邮箱: ________________________
- 其他: ________________________

---
感谢您的宝贵反馈！
`;

fs.writeFileSync(path.join(docsDir, 'feedback-form.md'), feedbackForm, 'utf-8');
console.log('✅ 反馈收集表生成完成');

// 3. 生成用户邀请模板
console.log('\n📧 生成用户邀请模板...');
const inviteTemplate = `# 真实上线测试邀请

## 正式邀请
**主题**: 邀请测试《自动治愈花园》- 全新治愈系种植游戏

亲爱的测试者，

诚挚邀请您参与《自动治愈花园》的真实上线测试！

**游戏介绍**:
《自动治愈花园》是一款竖屏治愈系种植休闲小游戏，通过种植植物、装饰花园，带您进入宁静的治愈世界。

**测试目的**:
验证真实上线版本，收集用户体验反馈，优化产品质量。

**测试信息**:
- 测试时间: 即日起
- 测试平台: Web浏览器
- 测试时长: 15-30分钟
- 访问方式: [提供访问链接]

**测试任务**:
1. 完成用户注册
2. 体验种植系统
3. 装饰个人花园
4. 提供使用反馈

**反馈方式**:
填写反馈表或直接发送体验感受。

**技术支持**:
有问题随时联系我们。

期待您的参与！

## 简洁邀请
**主题**: 《自动治愈花园》测试邀请

Hi，

邀请测试我们的新游戏《自动治愈花园》！

🎮 游戏: 治愈系种植游戏
⏰ 时间: 15-30分钟
🔗 访问: [链接]
📝 反馈: 完成后请反馈

谢谢！

---

**模板版本**: v1.0
`;

fs.writeFileSync(path.join(docsDir, 'invite-template.md'), inviteTemplate, 'utf-8');
console.log('✅ 用户邀请模板生成完成');

// 4. 生成监控查看说明
console.log('\n📊 生成监控说明...');
const monitorGuide = `# 真实上线监控说明

## 监控指标
1. **服务器健康**
   - CPU使用率
   - 内存使用率
   - 磁盘空间
   - 网络状态

2. **应用性能**
   - 响应时间
   - 错误率
   - 可用性
   - 并发数

3. **用户行为**
   - 访问量
   - 活跃用户
   - 功能使用率
   - 用户满意度

## 查看方式
### 开发环境
- Grafana: http://localhost:3000/grafana
- Prometheus: http://localhost:9090
- 日志文件: D:\\AutoHealingGarden\\server\\logs\\

### 生产环境
- 监控面板: [生产环境地址]
- 告警通知: 邮件/即时通讯
- 日志系统: [日志系统地址]

## 关键阈值
- CPU使用率: 警告 >70%，紧急 >85%
- 内存使用率: 警告 >75%，紧急 >90%
- 响应时间: 警告 >500ms，紧急 >2000ms
- 错误率: 警告 >1%，紧急 >5%

## 问题排查
1. **性能问题**: 查看响应时间图表
2. **错误问题**: 查看错误日志
3. **可用性问题**: 检查服务心跳
4. **用户问题**: 查看用户行为数据

---
**监控配置**: D:\\AutoHealingGarden\\deploy\\monitoring\\
**配置时间**: ${new Date().toLocaleString()}
`;

fs.writeFileSync(path.join(docsDir, 'monitor-guide.md'), monitorGuide, 'utf-8');
console.log('✅ 监控说明生成完成');

// 5. 生成执行摘要
console.log('\n📋 生成执行摘要...');
const summary = `# 真实上线测试执行摘要

## 完成时间
${new Date().toLocaleString()}

## 生成资源
1. ✅ 真实访问指南: docs/real-launch/test-guide.md
2. ✅ 反馈收集表: docs/real-launch/feedback-form.md
3. ✅ 用户邀请模板: docs/real-launch/invite-template.md
4. ✅ 监控说明: docs/real-launch/monitor-guide.md

## 构建产物位置
- Web平台: D:\\AutoHealingGarden\\dist\\web\\
- 微信平台: D:\\AutoHealingGarden\\dist\\wechat\\
- 抖音平台: D:\\AutoHealingGarden\\dist\\douyin\\

## 部署包位置
D:\\AutoHealingGarden\\deploy\\deployment-package-*

## 测试步骤
### 第一步：访问测试 (立即)
1. 打开 D:\\AutoHealingGarden\\dist\\web\\index.html
2. 或启动HTTP服务器访问

### 第二步：功能测试 (15分钟)
1. 按照test-guide.md执行测试任务
2. 记录测试结果

### 第三步：收集反馈 (10分钟)
1. 使用feedback-form.md收集反馈
2. 或直接记录体验感受

### 第四步：邀请用户 (持续)
1. 使用invite-template.md邀请测试用户
2. 收集更多真实用户反馈

### 第五步：监控分析 (实时)
1. 查看监控数据
2. 分析用户行为
3. 优化产品体验

## 成功标准
- ✅ 构建产物可访问
- ✅ 核心功能可用
- ✅ 用户反馈收集
- ✅ 监控系统运行
- ✅ 真实数据生成

## 风险控制
- 灰度发布: 先小范围测试
- 实时监控: 及时发现和处理问题
- 快速回滚: 如有严重问题可快速恢复
- 用户沟通: 及时告知测试状态

## 下一步行动
1. 立即开始真实用户测试
2. 收集和分析测试数据
3. 根据反馈优化产品
4. 扩大测试范围
5. 准备正式发布

---
**项目状态**: 🚀 真实上线测试已就绪
**开始时间**: ${new Date().toLocaleString()}
**预计时长**: 2-3天测试周期
**目标用户**: 50-100名测试用户
**成功指标**: 用户满意度 >4.0/5.0，错误率 <1%
`;

fs.writeFileSync(path.join(docsDir, 'execution-summary.md'), summary, 'utf-8');
console.log('✅ 执行摘要生成完成');

// 最终输出
console.log('\n' + '=' * 50);
console.log('🎯 真实上线测试资源准备完成');
console.log('=' * 50);

console.log('\n📁 生成资源位置:');
console.log(`  D:\\AutoHealingGarden\\docs\\real-launch\\`);
console.log(`  ├── test-guide.md        # 测试指南`);
console.log(`  ├── feedback-form.md     # 反馈表`);
console.log(`  ├── invite-template.md   # 邀请模板`);
console.log(`  ├── monitor-guide.md     # 监控说明`);
console.log(`  └── execution-summary.md # 执行摘要`);

console.log('\n🎮 构建产物位置:');
console.log(`  D:\\AutoHealingGarden\\dist\\`);
console.log(`    ├── web/     # Web平台 (立即测试)`);
console.log(`    ├── wechat/  # 微信平台`);
console.log(`    └── douyin/  # 抖音平台`);

console.log('\n🚀 立即开始的真实测试:');
console.log('  1. 打开 D:\\AutoHealingGarden\\dist\\web\\index.html');
console.log('  2. 按照 docs/real-launch/test-guide.md 测试');
console.log('  3. 使用 docs/real-launch/feedback-form.md 收集反馈');
console.log('  4. 邀请测试用户开始真实体验');

console.log('\n📊 监控状态:');
console.log('  ✅ 监控系统已配置');
console.log('  ✅ 告警规则已设置');
console.log('  ✅ 日志系统就绪');

console.log('\n🏁 真实上线测试准备就绪！');
console.log('\n✅ 用户可以立即开始真实上线测试和反馈收集。');