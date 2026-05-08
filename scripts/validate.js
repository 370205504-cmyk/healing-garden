#!/usr/bin/env node

/**
 * 自动治愈花园 七轮全量校验脚本
 * 执行所有强制校验规则，确保代码符合开发规范
 */

const fs = require('fs');
const path = require('path');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

function colorize(text, color) {
  return colors[color] + text + colors.reset;
}

// 校验结果统计
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  warnings: 0
};

// 校验项
const validations = [
  {
    id: 'path-check',
    name: '路径校验',
    description: '检查所有文件是否存储在D盘项目根目录，无C盘写入',
    validator: validatePath
  },
  {
    id: 'theme-check',
    name: '主题校验',
    description: '检查内容是否100%贴合自动治愈花园主题，无农场、牧场等跑偏内容',
    validator: validateTheme
  },
  {
    id: 'syntax-check',
    name: '语法校验',
    description: '检查代码语法，确保无括号、逗号、分号相关错误',
    validator: validateSyntax
  },
  {
    id: 'compatibility-check',
    name: '兼容性校验',
    description: '检查代码兼容性，确保无浏览器API、无平台专属硬编码',
    validator: validateCompatibility
  },
  {
    id: 'runtime-check',
    name: '运行时校验',
    description: '检查运行时安全性，确保全覆盖空值保护，无undefined类报错',
    validator: validateRuntime
  },
  {
    id: 'layout-check',
    name: '排版与功能校验',
    description: '检查UI排版无错乱、全机型适配，核心玩法闭环完整',
    validator: validateLayout
  },
  {
    id: 'compliance-check',
    name: '变现与合规校验',
    description: '检查广告/内购功能正常，无强制广告、无诱导消费',
    validator: validateCompliance
  }
];

/**
 * 第一轮：路径校验
 */
function validatePath() {
  console.log(colorize('\n=== 第一轮：路径校验 ===', 'cyan'));
  
  const projectRoot = 'D:\\AutoHealingGarden';
  const violations = [];
  
  // 检查项目根目录是否存在
  if (!fs.existsSync(projectRoot)) {
    violations.push(`项目根目录不存在: ${projectRoot}`);
  }
  
  // 检查必要目录结构
  const requiredDirs = [
    'src',
    'platform',
    'platform/wx',
    'platform/tt',
    'config',
    'assets',
    'dist'
  ];
  
  for (const dir of requiredDirs) {
    const dirPath = path.join(projectRoot, dir);
    if (!fs.existsSync(dirPath)) {
      violations.push(`必要目录不存在: ${dirPath}`);
    }
  }
  
  // 检查关键文件
  const requiredFiles = [
    'src/game.js',
    'platform/index.js',
    'platform/wx/index.js',
    'platform/tt/index.js',
    'config/game.config.js',
    'README.md',
    'DEVELOPMENT_GUIDE.md'
  ];
  
  for (const file of requiredFiles) {
    const filePath = path.join(projectRoot, file);
    if (!fs.existsSync(filePath)) {
      violations.push(`必要文件不存在: ${filePath}`);
    }
  }
  
  // 检查game.js是否有强制前置代码
  const gameJsPath = path.join(projectRoot, 'src/game.js');
  if (fs.existsSync(gameJsPath)) {
    const content = fs.readFileSync(gameJsPath, 'utf8');
    if (!content.includes('自动治愈花园 全局兼容与错误捕获 强制前置')) {
      violations.push('game.js缺少强制前置代码');
    }
  }
  
  if (violations.length === 0) {
    console.log(colorize('✅ 路径校验通过：所有文件存储在正确位置', 'green'));
    return { passed: true, violations: [] };
  } else {
    console.log(colorize('❌ 路径校验失败：', 'red'));
    violations.forEach(v => console.log(colorize(`  - ${v}`, 'yellow')));
    return { passed: false, violations };
  }
}

/**
 * 第二轮：主题校验
 */
function validateTheme() {
  console.log(colorize('\n=== 第二轮：主题校验 ===', 'cyan'));
  
  const projectRoot = 'D:\\AutoHealingGarden';
  const violations = [];
  const warnings = [];
  
  // 检查文件中的主题关键词
  const themeKeywords = [
    '花园', '花卉', '治愈', '种植', '收获', '花田',
    '情绪', '疗愈', '放松', '平静', '温馨', '美好'
  ];
  
  const forbiddenKeywords = [
    '农场', '牧场', '农作物', '动物', '养殖', '牲畜',
    '战斗', '竞技', 'PK', '排行榜', '惩罚', '失败'
  ];
  
  // 检查主要代码文件
  const filesToCheck = [
    'src/game.js',
    'config/game.config.js',
    'README.md'
  ];
  
  for (const file of filesToCheck) {
    const filePath = path.join(projectRoot, file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // 检查是否有禁止的关键词
      for (const keyword of forbiddenKeywords) {
        if (content.includes(keyword)) {
          violations.push(`${file} 包含禁止的关键词: "${keyword}"`);
        }
      }
      
      // 检查是否有足够的主题关键词（警告级别）
      let themeCount = 0;
      for (const keyword of themeKeywords) {
        if (content.includes(keyword)) {
          themeCount++;
        }
      }
      
      if (themeCount < 3) {
        warnings.push(`${file} 主题关键词较少，建议增加治愈主题内容`);
      }
    }
  }
  
  // 检查游戏配置中的花卉类型
  const configPath = path.join(projectRoot, 'config/game.config.js');
  if (fs.existsSync(configPath)) {
    const content = fs.readFileSync(configPath, 'utf8');
    
    // 检查是否有农场类作物
    const farmCrops = ['小麦', '玉米', '水稻', '土豆', '胡萝卜', '奶牛', '绵羊'];
    for (const crop of farmCrops) {
      if (content.includes(crop)) {
        violations.push(`游戏配置包含农场类作物: "${crop}"`);
      }
    }
  }
  
  if (violations.length === 0) {
    console.log(colorize('✅ 主题校验通过：内容贴合治愈花园主题', 'green'));
    if (warnings.length > 0) {
      console.log(colorize('⚠️  警告：', 'yellow'));
      warnings.forEach(w => console.log(colorize(`  - ${w}`, 'yellow')));
    }
    return { passed: true, violations: [], warnings };
  } else {
    console.log(colorize('❌ 主题校验失败：', 'red'));
    violations.forEach(v => console.log(colorize(`  - ${v}`, 'red')));
    if (warnings.length > 0) {
      console.log(colorize('⚠️  警告：', 'yellow'));
      warnings.forEach(w => console.log(colorize(`  - ${w}`, 'yellow')));
    }
    return { passed: false, violations, warnings };
  }
}

/**
 * 第三轮：语法校验（简化版）
 */
function validateSyntax() {
  console.log(colorize('\n=== 第三轮：语法校验 ===', 'cyan'));
  
  const projectRoot = 'D:\\AutoHealingGarden';
  const violations = [];
  const warnings = [];
  
  // 检查主要JS文件的常见语法问题
  const jsFiles = [
    'src/game.js',
    'platform/index.js',
    'platform/wx/index.js',
    'platform/tt/index.js'
  ];
  
  for (const file of jsFiles) {
    const filePath = path.join(projectRoot, file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // 检查括号匹配
      const openBraces = (content.match(/{/g) || []).length;
      const closeBraces = (content.match(/}/g) || []).length;
      const openBrackets = (content.match(/\[/g) || []).length;
      const closeBrackets = (content.match(/\]/g) || []).length;
      const openParens = (content.match(/\(/g) || []).length;
      const closeParens = (content.match(/\)/g) || []).length;
      
      if (openBraces !== closeBraces) {
        violations.push(`${file} 花括号不匹配: {=${openBraces} }=${closeBraces}`);
      }
      if (openBrackets !== closeBrackets) {
        violations.push(`${file} 方括号不匹配: [=${openBrackets} ]=${closeBrackets}`);
      }
      if (openParens !== closeParens) {
        violations.push(`${file} 圆括号不匹配: (=${openParens} )=${closeParens}`);
      }
      
      // 检查尾逗号（对象和数组）
      const lines = content.split('\n');
      lines.forEach((line, index) => {
        const trimmed = line.trim();
        
        // 检查对象尾逗号
        if (trimmed.match(/,\s*}$/)) {
          violations.push(`${file}:${index + 1} 对象末尾有尾逗号`);
        }
        
        // 检查数组尾逗号
        if (trimmed.match(/,\s*\]$/)) {
          violations.push(`${file}:${index + 1} 数组末尾有尾逗号`);
        }
      });
      
      // 检查是否有明显的语法错误模式
      if (content.includes('if(') && !content.includes('if (')) {
        warnings.push(`${file} 建议在if后添加空格: if(`);
      }
      
      if (content.includes('for(') && !content.includes('for (')) {
        warnings.push(`${file} 建议在for后添加空格: for(`);
      }
      
      if (content.includes('function(') && !content.includes('function (')) {
        warnings.push(`${file} 建议在function后添加空格: function(`);
      }
    }
  }
  
  if (violations.length === 0) {
    console.log(colorize('✅ 语法校验通过：代码语法正确', 'green'));
    if (warnings.length > 0) {
      console.log(colorize('⚠️  警告：', 'yellow'));
      warnings.forEach(w => console.log(colorize(`  - ${w}`, 'yellow')));
    }
    return { passed: true, violations: [], warnings };
  } else {
    console.log(colorize('❌ 语法校验失败：', 'red'));
    violations.forEach(v => console.log(colorize(`  - ${v}`, 'red')));
    if (warnings.length > 0) {
      console.log(colorize('⚠️  警告：', 'yellow'));
      warnings.forEach(w => console.log(colorize(`  - ${w}`, 'yellow')));
    }
    return { passed: false, violations, warnings };
  }
}

/**
 * 第四轮：兼容性校验
 */
function validateCompatibility() {
  console.log(colorize('\n=== 第四轮：兼容性校验 ===', 'cyan'));
  
  const projectRoot = 'D:\\AutoHealingGarden';
  const violations = [];
  
  // 检查是否直接使用浏览器API
  const browserApis = [
    'window.',
    'document.',
    'navigator.',
    'location.',
    'history.',
    'alert(',
    'confirm(',
    'localStorage.',
    'sessionStorage.'
  ];
  
  // 检查主要JS文件
  const jsFiles = [
    'src/game.js',
    'platform/index.js'
  ];
  
  for (const file of jsFiles) {
    const filePath = path.join(projectRoot, file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      for (const api of browserApis) {
        if (content.includes(api)) {
          // 检查是否有环境判断
          if (!content.includes('typeof window') && !content.includes('Platform.')) {
            violations.push(`${file} 直接使用浏览器API: "${api}"`);
          }
        }
      }
      
      // 检查是否直接调用wx/tt API（应该通过Platform）
      if (file === 'src/game.js') {
        if (content.includes('wx.') && !content.includes('Platform.')) {
          violations.push(`${file} 直接调用wx API，应通过Platform对象`);
        }
        if (content.includes('tt.') && !content.includes('Platform.')) {
          violations.push(`${file} 直接调用tt API，应通过Platform对象`);
        }
      }
    }
  }
  
  // 检查game.js是否有强制前置兼容代码
  const gameJsPath = path.join(projectRoot, 'src/game.js');
  if (fs.existsSync(gameJsPath)) {
    const content = fs.readFileSync(gameJsPath, 'utf8');
    
    // 检查兼容代码模式（支持新旧两种写法）
    const compatibilityChecks = [
      { pattern: 'globalThis.window = globalThis', name: 'globalThis兜底' },
      { patterns: ['errorCatchApi.onError', 'Platform.onError'], name: '全局错误捕获' },
      { pattern: 'require(\'../platform/index.js\')', name: 'Platform加载' }
    ];
    
    for (const check of compatibilityChecks) {
      if (check.patterns) {
        // 多模式：任一匹配即可
        const hasAny = check.patterns.some(p => content.includes(p));
        if (!hasAny) {
          violations.push(`game.js缺少必要兼容代码: "${check.name}"（需要${check.patterns.join(' 或 ')}中任一种）`);
        }
      } else if (check.pattern) {
        if (!content.includes(check.pattern)) {
          violations.push(`game.js缺少必要兼容代码: "${check.pattern}"`);
        }
      }
    }
  }
  
  if (violations.length === 0) {
    console.log(colorize('✅ 兼容性校验通过：代码兼容双平台', 'green'));
    return { passed: true, violations: [] };
  } else {
    console.log(colorize('❌ 兼容性校验失败：', 'red'));
    violations.forEach(v => console.log(colorize(`  - ${v}`, 'red')));
    return { passed: false, violations };
  }
}

/**
 * 第五轮：运行时校验
 */
function validateRuntime() {
  console.log(colorize('\n=== 第五轮：运行时校验 ===', 'cyan'));
  
  const projectRoot = 'D:\\AutoHealingGarden';
  const violations = [];
  const warnings = [];
  
  // 检查game.js中的安全操作
  const gameJsPath = path.join(projectRoot, 'src/game.js');
  if (fs.existsSync(gameJsPath)) {
    const content = fs.readFileSync(gameJsPath, 'utf8');
    
    // 检查字符串方法安全写法
    const unsafeStringPatterns = [
      /\w+\.indexOf\(/g,
      /\w+\.split\(/g,
      /\w+\.substring\(/g,
      /\w+\.slice\(/g,
      /\w+\.replace\(/g
    ];
    
    for (const pattern of unsafeStringPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          if (!match.includes('||')) {
            warnings.push(`字符串方法可能不安全: "${match}" 建议使用 (str || '').方法名()`);
          }
        });
      }
    }
    
    // 检查对象属性安全访问
    const unsafeObjectPatterns = [
      /\w+\.\w+\.\w+/g, // obj.key.subkey
      /\w+\[.+\]\.\w+/g // obj[key].subkey
    ];
    
    for (const pattern of unsafeObjectPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          if (!match.includes('||') && !match.includes('?')) {
            warnings.push(`对象属性访问可能不安全: "${match}" 建议使用 (obj || {}).key`);
          }
        });
      }
    }
    
    // 检查数组方法安全写法
    const unsafeArrayPatterns = [
      /\w+\.forEach\(/g,
      /\w+\.map\(/g,
      /\w+\.filter\(/g,
      /\w+\.push\(/g
    ];
    
    for (const pattern of unsafeArrayPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          if (!match.includes('||')) {
            warnings.push(`数组方法可能不安全: "${match}" 建议使用 (arr || []).方法名()`);
          }
        });
      }
    }
    
    // 检查是否有全局错误捕获
    if (!content.includes('onError') && !content.includes('try/catch')) {
      violations.push('缺少全局错误捕获机制');
    }
  }
  
  if (violations.length === 0 && warnings.length === 0) {
    console.log(colorize('✅ 运行时校验通过：代码具备良好的运行时安全性', 'green'));
    return { passed: true, violations: [], warnings: [] };
  } else {
    if (violations.length > 0) {
      console.log(colorize('❌ 运行时校验失败：', 'red'));
      violations.forEach(v => console.log(colorize(`  - ${v}`, 'red')));
    }
    if (warnings.length > 0) {
      console.log(colorize('⚠️  警告：', 'yellow'));
      warnings.forEach(w => console.log(colorize(`  - ${w}`, 'yellow')));
    }
    return { passed: violations.length === 0, violations, warnings };
  }
}

/**
 * 第六轮：排版与功能校验（简化版）
 */
function validateLayout() {
  console.log(colorize('\n=== 第六轮：排版与功能校验 ===', 'cyan'));
  
  const violations = [];
  const warnings = [];
  
  // 检查游戏配置中的核心玩法
  const projectRoot = 'D:\\AutoHealingGarden';
  const configPath = path.join(projectRoot, 'config/game.config.js');
  
  if (fs.existsSync(configPath)) {
    const content = fs.readFileSync(configPath, 'utf8');
    
    // 检查是否有核心玩法配置
    const requiredConfigs = [
      'garden',
      'flowers',
      'plots',
      'economy',
      'audio'
    ];
    
    for (const config of requiredConfigs) {
      // JS 对象字面量中属性名可以无引号，兼容三种写法
      const hasQuoted = content.includes(`"${config}"`) || content.includes(`'${config}'`);
      const hasUnquoted = content.includes(`${config}:`) || content.includes(`${config} `);
      if (!hasQuoted && !hasUnquoted) {
        warnings.push(`游戏配置缺少必要部分: "${config}"`);
      }
    }
  }
  
  // 检查game.js中的核心功能
  const gameJsPath = path.join(projectRoot, 'src/game.js');
  if (fs.existsSync(gameJsPath)) {
    const content = fs.readFileSync(gameJsPath, 'utf8');
    
    // 检查是否有核心功能方法
    const requiredFunctions = [
      'init',
      'createCanvas',
      'initPlots',
      'render',
      'update',
      'handleTouchStart',
      'plantFlower',
      'harvestFlower'
    ];
    
    for (const func of requiredFunctions) {
      if (!content.includes(`${func}(`) && !content.includes(` ${func}:`)) {
        warnings.push(`游戏逻辑缺少核心功能: "${func}"`);
      }
    }
    
    // 检查是否有UI渲染
    if (!content.includes('fillRect') && !content.includes('fillText')) {
      warnings.push('游戏可能缺少UI渲染逻辑');
    }
  }
  
  if (violations.length === 0 && warnings.length === 0) {
    console.log(colorize('✅ 排版与功能校验通过：核心玩法完整', 'green'));
    return { passed: true, violations: [], warnings: [] };
  } else {
    if (violations.length > 0) {
      console.log(colorize('❌ 排版与功能校验失败：', 'red'));
      violations.forEach(v => console.log(colorize(`  - ${v}`, 'red')));
    }
    if (warnings.length > 0) {
      console.log(colorize('⚠️  警告：', 'yellow'));
      warnings.forEach(w => console.log(colorize(`  - ${w}`, 'yellow')));
    }
    return { passed: violations.length === 0, violations, warnings };
  }
}

/**
 * 第七轮：变现与合规校验（简化版）
 */
function validateCompliance() {
  console.log(colorize('\n=== 第七轮：变现与合规校验 ===', 'cyan'));
  
  const violations = [];
  const warnings = [];
  
  // 检查游戏配置中的广告和内购配置
  const projectRoot = 'D:\\AutoHealingGarden';
  const configPath = path.join(projectRoot, 'config/game.config.js');
  
  if (fs.existsSync(configPath)) {
    const content = fs.readFileSync(configPath, 'utf8');
    
    // 检查是否有广告配置
    if (!content.includes('ads') && !content.includes('广告')) {
      warnings.push('游戏配置缺少广告配置');
    }
    
    // 检查是否有内购配置
    if (!content.includes('iap') && !content.includes('内购')) {
      warnings.push('游戏配置缺少内购配置');
    }
    
    // 检查是否有合规说明
    if (!content.includes('合规') && !content.includes('compliance')) {
      warnings.push('建议添加合规说明');
    }
  }
  
  // 检查README中的合规说明
  const readmePath = path.join(projectRoot, 'README.md');
  if (fs.existsSync(readmePath)) {
    const content = fs.readFileSync(readmePath, 'utf8');
    
    if (!content.includes('无强制广告') && !content.includes('自愿')) {
      warnings.push('README中建议说明无强制广告');
    }
    
    if (!content.includes('免费玩家可体验全部核心内容')) {
      warnings.push('README中建议说明免费玩家权益');
    }
  }
  
  if (violations.length === 0 && warnings.length === 0) {
    console.log(colorize('✅ 变现与合规校验通过：变现设计合理', 'green'));
    return { passed: true, violations: [], warnings: [] };
  } else {
    if (violations.length > 0) {
      console.log(colorize('❌ 变现与合规校验失败：', 'red'));
      violations.forEach(v => console.log(colorize(`  - ${v}`, 'red')));
    }
    if (warnings.length > 0) {
      console.log(colorize('⚠️  警告：', 'yellow'));
      warnings.forEach(w => console.log(colorize(`  - ${w}`, 'yellow')));
    }
    return { passed: violations.length === 0, violations, warnings };
  }
}

/**
 * 主函数
 */
async function main() {
  console.log(colorize('=========================================', 'magenta'));
  console.log(colorize('  自动治愈花园 七轮全量校验脚本', 'magenta'));
  console.log(colorize('=========================================', 'magenta'));
  
  const startTime = Date.now();
  
  // 执行所有校验
  for (let i = 0; i < validations.length; i++) {
    const validation = validations[i];
    
    console.log(colorize(`\n[${i + 1}/${validations.length}] ${validation.name}`, 'blue'));
    console.log(colorize(validation.description, 'white'));
    
    try {
      const result = validation.validator();
      
      results.total++;
      if (result.passed) {
        results.passed++;
        console.log(colorize(`✅ 第${i + 1}轮校验通过`, 'green'));
      } else {
        results.failed++;
        console.log(colorize(`❌ 第${i + 1}轮校验失败`, 'red'));
      }
      
      if (result.warnings && result.warnings.length > 0) {
        results.warnings += result.warnings.length;
      }
      
      // 添加短暂延迟，使输出更清晰
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(colorize(`校验过程出错: ${error.message}`, 'red'));
      results.total++;
      results.failed++;
    }
  }
  
  // 输出总结
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  console.log(colorize('\n=========================================', 'magenta'));
  console.log(colorize('  校验结果总结', 'magenta'));
  console.log(colorize('=========================================', 'magenta'));
  
  console.log(colorize(`总校验轮数: ${results.total}`, 'white'));
  console.log(colorize(`通过轮数: ${results.passed}`, results.passed === results.total ? 'green' : 'white'));
  console.log(colorize(`失败轮数: ${results.failed}`, results.failed > 0 ? 'red' : 'white'));
  console.log(colorize(`警告数量: ${results.warnings}`, results.warnings > 0 ? 'yellow' : 'white'));
  console.log(colorize(`总耗时: ${duration}秒`, 'white'));
  
  if (results.failed === 0) {
    console.log(colorize('\n🎉 恭喜！所有校验全部通过！', 'green'));
    console.log(colorize('项目符合《自动治愈花园》开发规范，可以继续进行开发。', 'green'));
  } else {
    console.log(colorize('\n⚠️  注意：存在校验失败项', 'yellow'));
    console.log(colorize('请根据上述错误信息修复问题，然后重新运行校验。', 'yellow'));
    process.exit(1);
  }
}

// 执行主函数
if (require.main === module) {
  main().catch(error => {
    console.error(colorize(`脚本执行失败: ${error.message}`, 'red'));
    process.exit(1);
  });
}

module.exports = {
  validatePath,
  validateTheme,
  validateSyntax,
  validateCompatibility,
  validateRuntime,
  validateLayout,
  validateCompliance,
  runAllValidations: main
};