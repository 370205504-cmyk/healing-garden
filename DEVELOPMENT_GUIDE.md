# 自动治愈花园 开发指南

## 一、开发环境配置

### 1.1 必要软件
- **Node.js**：版本≥14.0.0 [下载地址](https://nodejs.org/)
- **微信开发者工具**：最新版本 [下载地址](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
- **抖音开发者工具**：最新版本 [下载地址](https://developer.open-douyin.com/docs/resource/zh-CN/mini-game/develop/developer-instrument/download/)
- **代码编辑器**：VS Code 推荐 [下载地址](https://code.visualstudio.com/)
- **Git**：版本控制 [下载地址](https://git-scm.com/)

### 1.2 环境检查
```bash
# 检查Node.js版本
node --version

# 检查npm版本
npm --version

# 检查Git版本
git --version
```

### 1.3 项目目录初始化
```bash
# 克隆项目（如果使用Git）
git clone <repository-url> D:\AutoHealingGarden

# 或手动创建项目结构
mkdir D:\AutoHealingGarden
cd D:\AutoHealingGarden
```

## 二、代码结构与规范

### 2.1 文件结构规范
```
D:\AutoHealingGarden\
├── src\                          # 核心业务代码（禁止修改结构）
│   └── game.js                   # 游戏主逻辑（必须包含强制前置代码）
├── platform\                     # 双平台适配层（禁止修改结构）
│   ├── index.js                  # 统一平台适配层（必须使用）
│   ├── wx\                       # 微信端专属适配代码
│   └── tt\                       # 抖音端专属适配代码
├── config\                       # 游戏配置文件
│   ├── game.config.js            # 游戏主配置
│   ├── wechat.config.js          # 微信专属配置
│   └── douyin.config.js          # 抖音专属配置
├── assets\                       # 资源文件（按类型分类）
│   ├── images\                   # 图片资源（jpg/png/webp）
│   │   ├── flowers\              # 花卉图片
│   │   ├── ui\                   # UI元素
│   │   └── backgrounds\          # 背景图片
│   ├── audio\                    # 音频资源（mp3）
│   │   ├── bgm\                  # 背景音乐
│   │   ├── sfx\                  # 音效
│   │   └── ambient\              # 环境音效
│   └── ui\                       # UI素材（可选）
├── dist\                         # 打包输出（自动生成）
│   ├── wechat\                   # 微信小游戏包
│   └── douyin\                   # 抖音小游戏包
└── docs\                         # 项目文档
```

### 2.2 命名规范
- **文件命名**：使用小写字母+连字符，如 `game-config.js`
- **变量命名**：使用camelCase，如 `gameState`
- **常量命名**：使用UPPER_SNAKE_CASE，如 `MAX_PLOTS`
- **函数命名**：使用camelCase，动词开头，如 `initGame()`
- **类名命名**：使用PascalCase，如 `GameManager`

### 2.3 代码格式规范
```javascript
// ✅ 正确示例
function plantFlower(plotId, flowerType) {
  const flowerConfig = GameConfig.flowers[flowerType];
  if (!flowerConfig) {
    console.error('未知的花卉类型:', flowerType);
    return false;
  }
  
  // 检查花币是否足够
  if (GameConfig.gameState.coins < flowerConfig.price) {
    console.log('花币不足');
    return false;
  }
  
  return true;
}

// ❌ 错误示例
function plantFlower(plotId,flowerType){ // 缺少空格
const flowerConfig=GameConfig.flowers[flowerType] // 缺少分号
if(!flowerConfig){console.error('未知的花卉类型:',flowerType);return false} // 括号混乱
```

## 三、强制前置代码模板

### 3.1 game.js 文件顶部必须包含
```javascript
// ==========================================
// 自动治愈花园 全局兼容与错误捕获 强制前置
// 存储路径：D:\AutoHealingGarden\src\game.js
// 禁止修改、禁止移动位置，必须放在文件最顶部
// ==========================================
!function(){
  if (typeof globalThis === 'undefined') return;
  // 兼容window全局对象
  if (typeof window === 'undefined') {
    globalThis.window = globalThis;
  }
  // 批量兼容H5常见全局对象
  const compatVars = ['self', 'global', 'top', 'parent', 'navigator', 'location', 'history', 'screen'];
  compatVars.forEach(function(key) {
    if (typeof globalThis[key] === 'undefined') {
      globalThis[key] = globalThis;
    }
  });
}();

// 全局错误捕获 防止游戏卡死
const errorCatchApi = typeof wx !== 'undefined' ? wx : tt;
errorCatchApi.onError(function(err) {
  console.error('游戏运行错误（已自动捕获）:', err);
  return true;
});

// 引入双平台统一适配层
require('../platform/index.js');

// ==========================================
// 下方仅可编写花园主题业务代码
// ==========================================
```

## 四、平台适配开发规范

### 4.1 统一平台接口调用
```javascript
// ✅ 正确：使用Platform对象
Platform.setStorage('gameState', gameData);
const savedData = Platform.getStorage('gameState', defaultValue);
const audio = Platform.createAudio();

// ❌ 错误：直接调用平台API
wx.setStorageSync('gameState', gameData); // 禁止！
tt.setStorageSync('gameState', gameData); // 禁止！
```

### 4.2 平台判断
```javascript
// 平台环境判断
if (Platform.isWx) {
  // 微信专属逻辑
  console.log('运行在微信环境');
} else if (Platform.isTT) {
  // 抖音专属逻辑
  console.log('运行在抖音环境');
}

// 平台特定功能调用
if (Platform.isWx && typeof WechatAdapter !== 'undefined') {
  WechatAdapter.social.shareToTimeline(shareOptions);
} else if (Platform.isTT && typeof DouyinAdapter !== 'undefined') {
  DouyinAdapter.social.inviteFriend();
}
```

### 4.3 安全操作规范
```javascript
// 字符串操作安全写法
const safeIndex = (str || '').indexOf(search || '');
const safeSplit = (str || '').split(separator || '');

// 对象属性安全访问
const safeValue = (obj || {})[key] || defaultValue;
const nestedValue = ((obj || {}).nested || {}).value;

// 数组操作安全写法
(safeArray || []).forEach(item => {
  // 处理逻辑
});
const mappedArray = (safeArray || []).map(item => item.value);
```

## 五、核心系统开发指南

### 5.1 花园地块系统
```javascript
// 花田状态定义
const PLOT_STATES = {
  EMPTY: 'empty',      // 可播种
  PLANTING: 'planting', // 种植中
  GROWING: 'growing',  // 生长中
  READY: 'ready',      // 可收获
  WITHERED: 'withered' // 枯萎可清理
};

// 花田数据结构
const plot = {
  id: 0,
  x: 100,
  y: 150,
  width: 100,
  height: 100,
  isUnlocked: true,
  state: PLOT_STATES.EMPTY,
  flower: 'sunflower',
  plantTime: 1775667889168,
  growthProgress: 0.5 // 0-1范围
};

// 花田渲染逻辑
function renderPlot(plot) {
  switch (plot.state) {
    case PLOT_STATES.EMPTY:
      renderEmptyPlot(plot);
      break;
    case PLOT_STATES.GROWING:
      renderGrowingPlot(plot);
      break;
    case PLOT_STATES.READY:
      renderReadyPlot(plot);
      break;
    case PLOT_STATES.WITHERED:
      renderWitheredPlot(plot);
      break;
  }
}
```

### 5.2 花卉系统
```javascript
// 花卉配置示例
const FLOWER_CONFIG = {
  sunflower: {
    name: '向日葵',
    emoji: '🌻',
    growthTime: 600, // 秒
    reward: { coins: 10, exp: 10 },
    price: 5,
    description: '向阳而生，带来温暖与希望',
    unlockLevel: 1,
    rarity: 'common'
  },
  sakura: {
    name: '樱花',
    emoji: '🌸',
    growthTime: 7200, // 秒
    reward: { coins: 100, exp: 50 },
    price: 50,
    description: '短暂而绚烂，珍惜当下美好',
    unlockLevel: 5,
    rarity: 'rare'
  }
};

// 种植逻辑
function plantFlower(plotId, flowerType) {
  const plot = findPlotById(plotId);
  const flower = FLOWER_CONFIG[flowerType];
  
  if (!plot || !flower) return false;
  
  // 检查解锁条件
  if (flower.unlockLevel > GameConfig.gameState.level) {
    showMessage(`需要等级${flower.unlockLevel}才能种植`);
    return false;
  }
  
  // 检查花币
  if (GameConfig.gameState.coins < flower.price) {
    showMessage('花币不足');
    return false;
  }
  
  // 扣除花币并种植
  GameConfig.gameState.coins -= flower.price;
  plot.state = PLOT_STATES.GROWING;
  plot.flower = flowerType;
  plot.plantTime = Date.now();
  plot.growthProgress = 0;
  
  saveGameState();
  return true;
}
```

### 5.3 游戏状态管理
```javascript
// 游戏状态结构
const gameState = {
  // 玩家数据
  player: {
    id: 'user_123',
    nickname: '花园爱好者',
    level: 1,
    exp: 0,
    coins: 100,
    gems: 0
  },
  
  // 花园数据
  garden: {
    unlockedPlots: [0, 1, 2, 3, 4, 5], // 已解锁花田ID
    plots: {}, // 花田状态
    decorations: {} // 装饰品
  },
  
  // 收集数据
  collection: {
    flowers: {
      sunflower: { collected: 5, firstCollectTime: 1775667889168 },
      tulip: { collected: 2, firstCollectTime: 1775667889168 }
    },
    achievements: ['first_flower', 'level_5']
  },
  
  // 系统数据
  system: {
    lastSaveTime: 1775667889168,
    totalPlayTime: 3600, // 秒
    version: '1.0.0'
  }
};

// 自动保存机制
function setupAutoSave() {
  setInterval(() => {
    if (hasUnsavedChanges) {
      saveGameState();
      console.log('游戏状态已自动保存');
    }
  }, 30000); // 每30秒检查一次
}

// 保存游戏状态
function saveGameState() {
  try {
    Platform.setStorage('autoHealingGardenState', gameState);
    gameState.system.lastSaveTime = Date.now();
    hasUnsavedChanges = false;
  } catch (error) {
    console.error('保存游戏状态失败:', error);
  }
}
```

## 六、UI开发规范

### 6.1 响应式布局
```javascript
// 屏幕适配函数
function adaptScreen() {
  const screenWidth = Platform.isWx ? wx.getSystemInfoSync().screenWidth : 
                     Platform.isTT ? tt.getSystemInfoSync().screenWidth : 750;
  const screenHeight = Platform.isWx ? wx.getSystemInfoSync().screenHeight :
                      Platform.isTT ? tt.getSystemInfoSync().screenHeight : 1334;
  
  // 基准尺寸（设计稿尺寸）
  const designWidth = 750;
  const designHeight = 1334;
  
  // 计算缩放比例
  const scaleX = screenWidth / designWidth;
  const scaleY = screenHeight / designHeight;
  const scale = Math.min(scaleX, scaleY);
  
  return {
    screenWidth,
    screenHeight,
    scale,
    designWidth,
    designHeight
  };
}

// 尺寸转换
function adaptSize(size) {
  const { scale } = adaptScreen();
  return Math.round(size * scale);
}

// 位置转换
function adaptPosition(x, y) {
  const { scale } = adaptScreen();
  return {
    x: Math.round(x * scale),
    y: Math.round(y * scale)
  };
}
```

### 6.2 按钮交互规范
```javascript
// 按钮点击区域检查（必须≥44x44px）
function isButtonClicked(x, y, button) {
  const minSize = 44;
  const actualWidth = Math.max(button.width, minSize);
  const actualHeight = Math.max(button.height, minSize);
  
  // 调整按钮中心点
  const centerX = button.x + button.width / 2;
  const centerY = button.y + button.height / 2;
  
  const adjustedX = centerX - actualWidth / 2;
  const adjustedY = centerY - actualHeight / 2;
  
  return x >= adjustedX && x <= adjustedX + actualWidth &&
         y >= adjustedY && y <= adjustedY + actualHeight;
}

// 按钮点击反馈
function handleButtonClick(button) {
  // 视觉反馈：缩放动画
  animateButton(button, 'scale', 0.95, 100);
  
  // 音效反馈
  playSound('button_click');
  
  // 触觉反馈（如果支持）
  if (Platform.isWx) {
    wx.vibrateShort();
  } else if (Platform.isTT) {
    tt.vibrateShort();
  }
  
  // 执行按钮动作
  setTimeout(() => {
    executeButtonAction(button.action);
  }, 150);
}
```

## 七、音效开发规范

### 7.1 音效管理
```javascript
class AudioManager {
  constructor() {
    this.bgm = null;
    this.sfxCache = {};
    this.isMuted = false;
    this.bgmVolume = 0.3; // 背景音乐音量30%
    this.sfxVolume = 0.3; // 音效音量30%
  }
  
  // 播放背景音乐
  playBGM(name) {
    if (this.isMuted) return;
    
    // 停止当前背景音乐
    if (this.bgm) {
      this.bgm.stop();
    }
    
    // 创建新的背景音乐
    this.bgm = Platform.createAudio();
    this.bgm.src = `assets/audio/bgm/${name}.mp3`;
    this.bgm.loop = true;
    this.bgm.volume = this.bgmVolume;
    this.bgm.play();
  }
  
  // 播放音效
  playSFX(name) {
    if (this.isMuted) return;
    
    // 从缓存获取或创建音效
    if (!this.sfxCache[name]) {
      const audio = Platform.createAudio();
      audio.src = `assets/audio/sfx/${name}.mp3`;
      audio.volume = this.sfxVolume;
      this.sfxCache[name] = audio;
    }
    
    // 播放音效
    const audio = this.sfxCache[name];
    audio.stop(); // 停止当前播放（如果需要立即重新播放）
    audio.play();
  }
  
  // 切换静音
  toggleMute() {
    this.isMuted = !this.isMuted;
    
    if (this.isMuted) {
      if (this.bgm) this.bgm.pause();
    } else {
      if (this.bgm) this.bgm.play();
    }
    
    return this.isMuted;
  }
}
```

## 八、测试与验证

### 8.1 七轮全量校验清单

#### 第一轮：路径校验
- [ ] 确认所有文件存储在 `D:\AutoHealingGarden\` 目录下
- [ ] 确认无任何C盘写入操作
- [ ] 确认资源引用使用相对路径

#### 第二轮：主题校验
- [ ] 确认100%贴合自动治愈花园主题
- [ ] 确认无农场、牧场等跑偏内容
- [ ] 确认所有文案符合治愈定位

#### 第三轮：语法校验
- [ ] ESLint检查通过，无语法错误
- [ ] 确认括号完全闭合
- [ ] 确认无尾逗号
- [ ] 确认每行代码有分号

#### 第四轮：兼容性校验
- [ ] 确认无 `window`/`document` 等浏览器API
- [ ] 确认使用 `Platform` 对象调用平台API
- [ ] 确认双平台适配正常

#### 第五轮：运行时校验
- [ ] 确认所有字符串方法使用安全写法
- [ ] 确认所有对象属性访问使用安全写法
- [ ] 确认所有数组方法使用安全写法
- [ ] 模拟测试无运行时崩溃

#### 第六轮：排版与功能校验
- [ ] 确认UI排版无错乱
- [ ] 确认全机型适配正常
- [ ] 确认核心玩法闭环完整
- [ ] 确认音效全量覆盖

#### 第七轮：变现与合规校验
- [ ] 确认广告功能正常
- [ ] 确认内购功能正常
- [ ] 确认无强制广告
- [ ] 确认符合平台合规要求

### 8.2 自动化测试脚本
```javascript
// test-validation.js
const validationTests = [
  {
    name: '路径校验',
    test: () => {
      // 检查当前工作目录
      return process.cwd().startsWith('D:\\AutoHealingGarden');
    }
  },
  {
    name: '语法校验',
    test: () => {
      // 执行ESLint检查
      const { execSync } = require('child_process');
      try {
        execSync('npx eslint src/**/*.js --no-eslintrc --config .eslintrc.json');
        return true;
      } catch {
        return false;
      }
    }
  }
];

// 运行所有测试
function runAllTests() {
  console.log('开始七轮全量校验...\n');
  
  let allPassed = true;
  validationTests.forEach((test, index) => {
    const passed = test.test();
    console.log(`第${index + 1}轮：${test.name} - ${passed ? '✅ 通过' : '❌ 失败'}`);
    if (!passed) allPassed = false;
  });
  
  console.log(`\n校验结果：${allPassed ? '全部通过 ✅' : '存在失败项 ❌'}`);
  return allPassed;
}

module.exports = { runAllTests };
```

## 九、部署与发布

### 9.1 微信小游戏部署
1. 打开微信开发者工具
2. 导入项目：`D:\AutoHealingGarden\dist\wechat`
3. 配置AppID（需要注册微信小程序）
4. 点击"上传"按钮
5. 在微信公众平台提交审核

### 9.2 抖音小游戏部署
1. 打开抖音开发者工具
2. 导入项目：`D:\AutoHealingGarden\dist\douyin`
3. 配置AppID（需要注册抖音小程序）
4. 点击"上传"按钮
5. 在抖音开放平台提交审核

### 9.3 版本管理
- 使用语义化版本号：`主版本.次版本.修订版本`
- 每次发布更新CHANGELOG.md
- 重大更新需要兼容旧版本数据

## 十、故障排除

### 10.1 常见问题

#### 问题1：游戏黑屏
**可能原因**：
1. Canvas创建失败
2. 平台API未正确初始化
3. 资源加载失败

**解决方案**：
```javascript
// 添加Canvas创建检查
if (!this.canvas || !this.ctx) {
  console.error('Canvas创建失败，尝试重新创建');
  this.createCanvas();
}
```

#### 问题2：触摸事件无响应
**可能原因**：
1. 点击区域太小（<44x44px）
2. 事件绑定失败
3. 坐标计算错误

**解决方案**：
```javascript
// 确保点击区域足够大
const minSize = 44;
const effectiveWidth = Math.max(button.width, minSize);
const effectiveHeight = Math.max(button.height, minSize);
```

#### 问题3：音效播放失败
**可能原因**：
1. 音频文件路径错误
2. 平台音频API限制
3. 音量设置为0

**解决方案**：
```javascript
// 添加音频错误处理
audio.onError((err) => {
  console.error('音频播放失败:', err);
  // 降级处理：不播放音效但不影响游戏
});
```

### 10.2 调试技巧
```javascript
// 添加调试模式
const DEBUG_MODE = true;

function debugLog(...args) {
  if (DEBUG_MODE) {
    console.log('[DEBUG]', ...args);
  }
}

// 性能监控
function monitorPerformance() {
  const startTime = Date.now();
  
  // 执行需要监控的代码
  
  const endTime = Date.now();
  debugLog(`执行耗时: ${endTime - startTime}ms`);
}
```

---

**最后更新：2026-04-09**
**维护者：自动治愈花园开发团队**