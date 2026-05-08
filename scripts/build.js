#!/usr/bin/env node

/**
 * 自动治愈花园构建脚本
 * 将核心代码复制到微信和抖音的dist目录
 */

const fs = require('fs-extra');
const path = require('path');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function colorize(text, color) {
  return colors[color] + text + colors.reset;
}

// 项目根目录
const projectRoot = path.resolve(__dirname, '..');

// 目标目录
const targets = [
  {
    name: '微信小游戏',
    path: path.join(projectRoot, 'dist', 'wechat'),
    platform: 'wx'
  },
  {
    name: '抖音小游戏',
    path: path.join(projectRoot, 'dist', 'douyin'),
    platform: 'tt'
  }
];

// 需要复制的文件
const filesToCopy = [
  {
    src: 'src/game.js',
    dest: 'game.js',
    transform: null // 不需要转换
  },
  {
    src: 'platform/index.js',
    dest: 'platform.js',
    transform: null
  }
];

// 需要根据平台转换的文件
const platformSpecificFiles = [
  {
    src: 'platform/wx/index.js',
    dest: 'wechat-adapter.js',
    platform: 'wx'
  },
  {
    src: 'platform/tt/index.js',
    dest: 'douyin-adapter.js',
    platform: 'tt'
  }
];

// 配置文件
const configFiles = [
  {
    src: 'config/game.config.js',
    dest: 'config/game.config.js'
  }
];

/**
 * 构建单个目标平台
 */
async function buildTarget(target) {
  console.log(colorize(`\n构建 ${target.name} 版本...`, 'cyan'));
  
  // 确保目标目录存在
  await fs.ensureDir(target.path);
  
  let fileCount = 0;
  
  // 复制通用文件
  for (const file of filesToCopy) {
    const srcPath = path.join(projectRoot, file.src);
    const destPath = path.join(target.path, file.dest);
    
    if (await fs.pathExists(srcPath)) {
      let content = await fs.readFile(srcPath, 'utf8');
      
      // 应用转换（如果有）
      if (file.transform) {
        content = file.transform(content, target.platform);
      }
      
      await fs.writeFile(destPath, content);
      fileCount++;
      console.log(colorize(`  ✅ 复制: ${file.src} → ${file.dest}`, 'green'));
    } else {
      console.log(colorize(`  ❌ 源文件不存在: ${file.src}`, 'red'));
    }
  }
  
  // 复制平台特定文件
  for (const file of platformSpecificFiles) {
    if (file.platform === target.platform) {
      const srcPath = path.join(projectRoot, file.src);
      const destPath = path.join(target.path, file.dest);
      
      if (await fs.pathExists(srcPath)) {
        await fs.copy(srcPath, destPath);
        fileCount++;
        console.log(colorize(`  ✅ 复制: ${file.src} → ${file.dest}`, 'green'));
      } else {
        console.log(colorize(`  ❌ 源文件不存在: ${file.src}`, 'red'));
      }
    }
  }
  
  // 复制配置文件
  for (const file of configFiles) {
    const srcPath = path.join(projectRoot, file.src);
    const destPath = path.join(target.path, file.dest);
    
    if (await fs.pathExists(srcPath)) {
      await fs.copy(srcPath, destPath);
      fileCount++;
      console.log(colorize(`  ✅ 复制: ${file.src} → ${file.dest}`, 'green'));
    } else {
      console.log(colorize(`  ❌ 源文件不存在: ${file.src}`, 'red'));
    }
  }
  
  // 创建平台特定的game.json配置文件
  await createPlatformConfig(target);
  
  console.log(colorize(`  ${target.name} 构建完成，共处理 ${fileCount} 个文件`, 'green'));
  return fileCount;
}

/**
 * 创建平台特定的配置文件
 */
async function createPlatformConfig(target) {
  const configPath = path.join(target.path, 'game.json');
  
  const baseConfig = {
    deviceOrientation: 'portrait',
    showStatusBar: false,
    networkTimeout: {
      request: 10000,
      connectSocket: 10000,
      uploadFile: 10000,
      downloadFile: 10000
    }
  };
  
  // 平台特定配置
  let platformConfig = {};
  
  if (target.platform === 'wx') {
    platformConfig = {
      ...baseConfig,
      libVersion: "2.19.4",
      swc: false,
      enhance: false,
      minified: false,
      disableUseStrict: true
    };
  } else if (target.platform === 'tt') {
    platformConfig = {
      ...baseConfig,
      libVersion: "2.0.0",
      swc: false
    };
  }
  
  await fs.writeJson(configPath, platformConfig, { spaces: 2 });
  console.log(colorize(`  ✅ 创建: ${target.platform}/game.json`, 'green'));
}

/**
 * 创建README文件
 */
async function createReadme(target) {
  const readmePath = path.join(target.path, 'README.md');
  
  const readmeContent = `# ${target.name} 版本

## 项目信息
- **游戏名称**: 自动治愈花园
- **平台**: ${target.name}
- **版本**: 1.0.0
- **构建时间**: ${new Date().toISOString()}

## 文件说明
- \`game.js\` - 游戏主逻辑
- \`platform.js\` - 平台适配层
- ${target.platform === 'wx' ? '`wechat-adapter.js`' : '`douyin-adapter.js`'} - 平台专属适配器
- \`config/game.config.js\` - 游戏配置
- \`game.json\` - 平台配置文件

## 运行说明
1. 使用${target.name}开发者工具打开本目录
2. 配置AppID（需要注册${target.name === '微信小游戏' ? '微信小程序' : '抖音小程序'}）
3. 点击"预览"按钮测试游戏
4. 点击"上传"按钮发布到平台

## 注意事项
- 确保所有资源文件使用相对路径
- 平台API调用必须通过Platform对象
- 生产环境需要配置正确的广告ID和内购配置

---

**自动治愈花园开发团队** © 2026
`;

  await fs.writeFile(readmePath, readmeContent, 'utf8');
  console.log(colorize(`  ✅ 创建: ${target.name}/README.md`, 'green'));
}

/**
 * 主函数
 */
async function main() {
  console.log(colorize('=========================================', 'magenta'));
  console.log(colorize('  自动治愈花园构建脚本', 'magenta'));
  console.log(colorize('=========================================', 'magenta'));
  
  const startTime = Date.now();
  
  try {
    // 检查必要目录和文件
    console.log(colorize('\n检查项目结构...', 'cyan'));
    
    const requiredPaths = [
      'src/game.js',
      'platform/index.js',
      'platform/wx/index.js',
      'platform/tt/index.js',
      'config/game.config.js'
    ];
    
    let allFilesExist = true;
    for (const filePath of requiredPaths) {
      const fullPath = path.join(projectRoot, filePath);
      if (await fs.pathExists(fullPath)) {
        console.log(colorize(`  ✅ ${filePath}`, 'green'));
      } else {
        console.log(colorize(`  ❌ ${filePath} (文件不存在)`, 'red'));
        allFilesExist = false;
      }
    }
    
    if (!allFilesExist) {
      console.log(colorize('\n❌ 缺少必要文件，构建中止', 'red'));
      process.exit(1);
    }
    
    // 构建所有目标平台
    let totalFiles = 0;
    for (const target of targets) {
      const fileCount = await buildTarget(target);
      totalFiles += fileCount;
      
      // 创建README
      await createReadme(target);
    }
    
    // 输出总结
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log(colorize('\n=========================================', 'magenta'));
    console.log(colorize('  构建完成！', 'magenta'));
    console.log(colorize('=========================================', 'magenta'));
    
    console.log(colorize(`总文件数: ${totalFiles}`, 'white'));
    console.log(colorize(`目标平台: ${targets.length}`, 'white'));
    console.log(colorize(`构建耗时: ${duration}秒`, 'white'));
    
    console.log(colorize('\n🎉 构建成功！', 'green'));
    console.log(colorize(`输出目录:`, 'white'));
    targets.forEach(target => {
      console.log(colorize(`  - ${target.name}: ${path.relative(projectRoot, target.path)}`, 'cyan'));
    });
    
    console.log(colorize('\n下一步:', 'yellow'));
    console.log(colorize('1. 打开对应平台的开发者工具', 'white'));
    console.log(colorize('2. 导入构建输出目录', 'white'));
    console.log(colorize('3. 配置AppID和项目设置', 'white'));
    console.log(colorize('4. 点击"预览"测试游戏', 'white'));
    
  } catch (error) {
    console.error(colorize(`\n❌ 构建失败: ${error.message}`, 'red'));
    process.exit(1);
  }
}

// 执行主函数
if (require.main === module) {
  // 检查是否安装了fs-extra
  try {
    require('fs-extra');
  } catch (error) {
    console.error(colorize('需要安装 fs-extra 模块', 'red'));
    console.log(colorize('运行: npm install fs-extra --save-dev', 'yellow'));
    process.exit(1);
  }
  
  main().catch(error => {
    console.error(colorize(`脚本执行失败: ${error.message}`, 'red'));
    process.exit(1);
  });
}

module.exports = {
  buildTarget,
  createPlatformConfig,
  createReadme
};