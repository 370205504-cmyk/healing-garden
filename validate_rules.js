// 自动治愈花园强制规则验证脚本
// 验证 game.js 是否符合《治愈花园游戏开发.dm》中的所有强制规则

const fs = require('fs');
const path = require('path');

console.log('=== 自动治愈花园强制规则验证 ===');

// 读取 game.js 文件
const gameJsPath = path.join(__dirname, 'src', 'game.js');
let gameJsContent = '';
try {
  gameJsContent = fs.readFileSync(gameJsPath, 'utf8');
  console.log('✅ game.js 文件读取成功');
} catch (error) {
  console.error('❌ game.js 文件读取失败:', error);
  process.exit(1);
}

// 验证结果收集
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  checks: []
};

// 验证函数
function check(description, condition, isWarning = false) {
  const result = {
    description,
    passed: condition,
    isWarning
  };
  
  results.checks.push(result);
  
  if (condition) {
    if (isWarning) {
      results.warnings++;
      console.log(`⚠️  ${description}`);
    } else {
      results.passed++;
      console.log(`✅ ${description}`);
    }
  } else {
    results.failed++;
    console.log(`❌ ${description}`);
  }
}

console.log('\n--- 1. 存储路径验证 ---');
check('项目文件存储在 D:\\AutoHealingGarden 目录', __dirname.includes('AutoHealingGarden'), true);

console.log('\n--- 2. 强制前置代码验证 ---');
check('文件顶部包含全局兼容与错误捕获代码', 
  gameJsContent.includes('全局兼容与错误捕获') && 
  gameJsContent.indexOf('全局兼容与错误捕获') < 500, // 确保在文件顶部
  false);

check('包含全局错误捕获 wx.onError 或 tt.onError',
  gameJsContent.includes('onError(function(err)'),
  false);

console.log('\n--- 3. 场景重构验证 ---');
check('包含背景渐变描述（浅天蓝柔雾渐变）',
  gameJsContent.includes('浅天蓝柔雾') || gameJsContent.includes('SKY_TOP'),
  false);

check('包含花园围栏描述',
  gameJsContent.includes('围栏') || gameJsContent.includes('FENCE'),
  false);

check('包含花土地基描述',
  gameJsContent.includes('花土地') || gameJsContent.includes('SOIL'),
  false);

check('包含石板小径描述',
  gameJsContent.includes('石板小径') || gameJsContent.includes('PATH'),
  false);

check('包含青草地描述',
  gameJsContent.includes('青草地') || gameJsContent.includes('FOREGROUND_GRASS'),
  false);

console.log('\n--- 4. UI布局验证 ---');
check('顶部导航栏实现（5个按钮）',
  gameJsContent.includes('种子') && 
  gameJsContent.includes('图鉴') && 
  gameJsContent.includes('装扮') && 
  gameJsContent.includes('背包') && 
  gameJsContent.includes('好友'),
  false);

check('花田网格布局（4行6列）',
  gameJsContent.includes('PLOT_ROWS: 4') && 
  gameJsContent.includes('PLOT_COLS: 6'),
  false);

check('底部功能栏实现（3个按钮）',
  gameJsContent.includes('一键收获') && 
  gameJsContent.includes('一键清理') && 
  gameJsContent.includes('设置'),
  false);

console.log('\n--- 5. 动画与音效验证 ---');
check('包含动画相关代码（生长动画、呼吸动画）',
  gameJsContent.includes('生长动画') || 
  gameJsContent.includes('drawGrowingFlower') || 
  gameJsContent.includes('呼吸动画'),
  false);

check('包含音效相关代码',
  gameJsContent.includes('playSound') || 
  gameJsContent.includes('音效'),
  false);

console.log('\n--- 6. 玩法闭环验证 ---');
check('包含种植系统',
  gameJsContent.includes('plantFlower') || 
  gameJsContent.includes('种植'),
  false);

check('包含生长系统',
  gameJsContent.includes('growthTime') || 
  gameJsContent.includes('生长'),
  false);

check('包含收获系统',
  gameJsContent.includes('harvestFlower') || 
  gameJsContent.includes('收获'),
  false);

check('包含清理系统',
  gameJsContent.includes('cleanPlot') || 
  gameJsContent.includes('清理'),
  false);

check('包含升级系统',
  gameJsContent.includes('level') || 
  gameJsContent.includes('升级'),
  false);

console.log('\n--- 7. 代码质量验证 ---');
check('使用安全字符串操作（避免 undefined 错误）',
  gameJsContent.includes('safeGet') || 
  gameJsContent.includes('safeString') ||
  gameJsContent.includes('|| \'\''),
  false);

check('使用双平台统一适配层',
  gameJsContent.includes('platform/index.js') || 
  gameJsContent.includes('require(\'../platform/index.js\')'),
  false);

check('竖屏适配（SCREEN_WIDTH 和 SCREEN_HEIGHT）',
  gameJsContent.includes('SCREEN_WIDTH: 750') && 
  gameJsContent.includes('SCREEN_HEIGHT: 1334'),
  false);

console.log('\n--- 8. 主题纯净性验证 ---');
check('不包含农场相关词汇（农场、牧场、牲畜、农作物）',
  !gameJsContent.includes('农场') && 
  !gameJsContent.includes('牧场') && 
  !gameJsContent.includes('牲畜') && 
  !gameJsContent.includes('农作物'),
  false);

check('花卉主题词汇存在（花田、花卉、花园、治愈）',
  gameJsContent.includes('花田') || 
  gameJsContent.includes('花卉') || 
  gameJsContent.includes('花园') || 
  gameJsContent.includes('治愈'),
  false);

// 输出总结
console.log('\n=== 验证结果总结 ===');
console.log(`总计检查: ${results.checks.length}`);
console.log(`通过: ${results.passed}`);
console.log(`失败: ${results.failed}`);
console.log(`警告: ${results.warnings}`);

if (results.failed > 0) {
  console.log('\n❌ 验证失败，请修复以下问题：');
  results.checks.filter(c => !c.passed && !c.isWarning).forEach(c => {
    console.log(`  - ${c.description}`);
  });
} else {
  console.log('\n✅ 所有强制规则验证通过！');
}

if (results.warnings > 0) {
  console.log('\n⚠️  警告（不影响核心功能）：');
  results.checks.filter(c => c.isWarning && !c.passed).forEach(c => {
    console.log(`  - ${c.description}`);
  });
}

// 退出码
process.exit(results.failed > 0 ? 1 : 0);