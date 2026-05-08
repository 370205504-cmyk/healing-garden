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
if (errorCatchApi && errorCatchApi.onError) {
  errorCatchApi.onError(function(err) {
    console.error('游戏运行错误（已自动捕获）:', err);
    return true;
  });
}

// 引入双平台统一适配层
try {
  require('../platform/index.js');
} catch (e) {
  console.warn('平台适配层加载未成功，继续运行：', e);
}

// ==========================================
// 下方仅可编写花园主题业务代码
// ==========================================

// 引入合成系统（Day9新增）
try {
  require('./synthesis/index.js');
  console.log('合成系统加载成功');
} catch (e) {
  console.warn('合成系统加载未成功，继续运行：', e);
}

// 自动治愈花园 v2.0 - 强制执行版
// 完全遵循《治愈花园游戏开发.dm》强制规则
// 创建时间：2026-04-09 14:22
// 开发团队：11人休闲解压游戏开发团队

console.log('自动治愈花园 v2.0 加载成功！');

// 游戏配置常量
const CONFIG = {
  // 屏幕尺寸
  SCREEN_WIDTH: 750,
  SCREEN_HEIGHT: 1334,
  
  // 场景分层高度占比
  NAV_BAR_HEIGHT_RATIO: 0.10,      // 顶部导航栏 10%
  FAR_VIEW_HEIGHT_RATIO: 0.08,     // 远景层 8%
  GARDEN_HEIGHT_RATIO: 0.67,       // 花田区 67% (剩余空间)
  FOREGROUND_HEIGHT_RATIO: 0.07,   // 前景层 7%
  BOTTOM_BAR_HEIGHT_RATIO: 0.08,   // 底部功能栏 8%
  
  // 花田网格
  PLOT_ROWS: 4,
  PLOT_COLS: 6,
  PLOT_TOTAL: 24,
  PLOT_INITIAL_UNLOCKED: 6,
  
  // 颜色定义（手绘治愈风格）
  COLORS: {
    SKY_TOP: '#E0F7FA',        // 浅天蓝柔雾
    SKY_BOTTOM: '#B2EBF2',     // 渐变色底部
    GRASS_TOP: '#C8E6C9',      // 薄荷绿草地顶部
    GRASS_BOTTOM: '#A5D6A7',   // 薄荷绿草地底部
    FENCE: '#FFFFFF',          // 白色围栏
    SOIL: '#8D6E63',           // 暖棕色花土地
    SOIL_TEXTURE: '#795548',   // 泥土肌理
    PATH: '#F5F5DC',           // 浅米色石板小径
    FOREGROUND_GRASS: '#81C784', // 前景青草地
    BUTTON_BG: 'rgba(255, 255, 255, 0.8)', // 半透明白色按钮背景
    BUTTON_TEXT: '#333333',    // 按钮文字颜色
    BUTTON_HIGHLIGHT: 'rgba(200, 230, 201, 0.3)', // 淡绿色高亮
    PLOT_BORDER: '#5D4037',    // 花田深棕色描边
    PLOT_LOCKED: 'rgba(189, 189, 189, 0.5)', // 锁定状态浅灰色磨砂
    TEXT_GREEN: '#558B2F',     // 可种花文字绿色
    TEXT_RED: '#E53935',       // 可收获文字红色
    TEXT_GRAY: '#666666'       // 灰色文字
  },
  
  // 按钮配置
  TOP_BUTTONS: [
    { id: 'seeds', icon: '🌱', text: '种子' },
    { id: 'album', icon: '📖', text: '图鉴' },
    { id: 'decorate', icon: '🎨', text: '装扮' },
    { id: 'backpack', icon: '🎒', text: '背包' },
    { id: 'friends', icon: '👥', text: '好友' }
  ],
  
  BOTTOM_BUTTONS: [
    { id: 'harvestAll', icon: '⛏️', text: '一键收获' },
    { id: 'cleanAll', icon: '🧹', text: '一键清理' },
    { id: 'synthesis', icon: '✨', text: '合成', unlockLevel: 2 },  // Day9新增，2级解锁
    { id: 'settings', icon: '⚙️', text: '设置' }
  ],
  
  // 花卉类型
  FLOWER_TYPES: [
    { id: 'sunflower', name: '向日葵', growthTime: 300, reward: 10, price: 5, color: '#FFD700' },
    { id: 'tulip', name: '郁金香', growthTime: 600, reward: 20, price: 10, color: '#FF69B4' },
    { id: 'rose', name: '玫瑰', growthTime: 1800, reward: 50, price: 25, color: '#E53935' },
    { id: 'daisy', name: '小雏菊', growthTime: 900, reward: 30, price: 15, color: '#FFFFFF', unlockLevel: 3 },
    { id: 'lavender', name: '薰衣草', growthTime: 3600, reward: 100, price: 50, color: '#9C27B0', unlockLevel: 5 }
  ]
};

// 游戏状态管理
const GameState = {
  level: 1,
  coins: 100,
  exp: 0,
  expToNextLevel: 100,
  unlockedPlots: CONFIG.PLOT_INITIAL_UNLOCKED,
  flowers: {}, // 存储每个花田的花卉状态
  lastUpdateTime: Date.now(),
  
  // 安全获取方法
  safeGet(obj, key, defaultValue) {
    return (obj || {})[key] || defaultValue;
  },
  
  // 更新方法
  update() {
    const now = Date.now();
    const elapsed = now - this.lastUpdateTime;
    this.lastUpdateTime = now;
    
    // 更新所有花卉的生长进度
    Object.keys(this.flowers).forEach(plotId => {
      const flower = this.flowers[plotId];
      if (flower && flower.growthStartTime && flower.growthTime && flower.progress < 1) {
        const growthElapsed = now - flower.growthStartTime;
        flower.progress = Math.min(growthElapsed / (flower.growthTime * 1000), 1);
        
        // 如果成熟了，更新状态
        if (flower.progress >= 1 && flower.state !== 'ready') {
          flower.state = 'ready';
        }
      }
    });
  },
  
  // 保存游戏状态
  save() {
    try {
      if (typeof wx !== 'undefined' && wx.setStorageSync) {
        wx.setStorageSync('healing_garden_state', {
          level: this.level,
          coins: this.coins,
          exp: this.exp,
          expToNextLevel: this.expToNextLevel,
          unlockedPlots: this.unlockedPlots,
          flowers: this.flowers,
          lastUpdateTime: this.lastUpdateTime
        });
      } else if (typeof tt !== 'undefined' && tt.setStorageSync) {
        tt.setStorageSync('healing_garden_state', {
          level: this.level,
          coins: this.coins,
          exp: this.exp,
          expToNextLevel: this.expToNextLevel,
          unlockedPlots: this.unlockedPlots,
          flowers: this.flowers,
          lastUpdateTime: this.lastUpdateTime
        });
      }
    } catch (e) {
      console.error('保存游戏状态未成功：', e);
    }
  },
  
  // 加载游戏状态
  load() {
    try {
      let savedData = null;
      if (typeof wx !== 'undefined' && wx.getStorageSync) {
        savedData = wx.getStorageSync('healing_garden_state');
      } else if (typeof tt !== 'undefined' && tt.getStorageSync) {
        savedData = tt.getStorageSync('healing_garden_state');
      }
      
      if (savedData) {
        this.level = this.safeGet(savedData, 'level', 1);
        this.coins = this.safeGet(savedData, 'coins', 100);
        this.exp = this.safeGet(savedData, 'exp', 0);
        this.expToNextLevel = this.safeGet(savedData, 'expToNextLevel', 100);
        this.unlockedPlots = this.safeGet(savedData, 'unlockedPlots', CONFIG.PLOT_INITIAL_UNLOCKED);
        this.flowers = this.safeGet(savedData, 'flowers', {});
        this.lastUpdateTime = this.safeGet(savedData, 'lastUpdateTime', Date.now());
        
        // 更新离线生长
        const now = Date.now();
        const offlineTime = now - this.lastUpdateTime;
        if (offlineTime > 0) {
          Object.keys(this.flowers).forEach(plotId => {
            const flower = this.flowers[plotId];
            if (flower && flower.growthStartTime && flower.growthTime && flower.progress < 1) {
              // 更新生长开始时间以反映离线生长
              flower.growthStartTime = flower.growthStartTime + offlineTime;
            }
          });
        }
        
        this.lastUpdateTime = now;
        console.log('游戏状态加载成功');
      }
    } catch (e) {
      console.error('加载游戏状态未成功：', e);
    }
  }
};

// 游戏主类
class HealingGardenGame {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.screenWidth = CONFIG.SCREEN_WIDTH;
    this.screenHeight = CONFIG.SCREEN_HEIGHT;
    this.plots = [];
    this.topButtons = [];
    this.bottomButtons = [];
    this.selectedSeed = null;
    this.isInitialized = false;
    this.lastRenderTime = 0;
    this.animationFrameId = null;
    
    // 合成系统属性（Day9新增）
    this.synthesisMode = false;
    this.synthesisManager = null;
    this.selectedForSynthesis = null;
    this.selectedPlotForSynthesis = null;
    
    // 特效状态（Day10新增）
    this.highlightedPlotIndex = -1;
    this.highlightPulsePhase = 0;
    this.synthesisEffects = [];
    this.renderRequested = false;
    
    // 性能监控（Day10新增）
    this.performanceMonitor = {
      frameCount: 0,
      lastFpsUpdate: 0,
      currentFps: 0,
      frameTimes: [],
      maxFrameTime: 0,
      minFrameTime: 1000,
      averageFrameTime: 0,
      enabled: false
    };
  }
  
  // 初始化游戏
  init() {
    console.log('初始化自动治愈花园 v2.0...');
    
    // 创建Canvas
    this.createCanvas();
    
    // 初始化游戏状态
    GameState.load();
    
    // 初始化花田
    this.initPlots();
    
    // 初始化UI按钮
    this.initUI();
    
    // 初始化合成系统（Day9新增）
    this.initSynthesisSystem();
    
    // 开始游戏循环
    this.startGameLoop();
    
    this.isInitialized = true;
    console.log('游戏初始化完成！');
    
    // Day10新增：启用性能监控（开发模式）
    this.togglePerformanceMonitor(true);
    
    // 自动保存定时器
    setInterval(() => {
      GameState.save();
    }, 30000); // 每30秒自动保存
  }
  
  // 初始化合成系统（Day9新增）
  initSynthesisSystem() {
    console.log('初始化合成系统...');
    
    try {
      // 检查合成系统是否已加载
      if (typeof SynthesisIntegrator !== 'undefined') {
        // 初始化合成集成器
        const success = SynthesisIntegrator.integrate(this);
        if (success) {
          this.synthesisManager = SynthesisIntegrator.synthesisManager;
          console.log('合成系统集成成功');
        } else {
          console.warn('合成系统集成未成功，将使用简化模式');
          this.initSimpleSynthesis();
        }
      } else {
        console.warn('合成系统模块未加载，使用简化模式');
        this.initSimpleSynthesis();
      }
    } catch (error) {
      console.error('合成系统初始化错误:', error);
      this.initSimpleSynthesis();
    }
  }
  
  // 简化合成系统（回退方案）
  initSimpleSynthesis() {
    console.log('初始化简化合成系统');
    
    // 基本合成逻辑
    this.synthesisManager = {
      isSynthesisMode: false,
      selectedPlant: null,
      selectedPlotIndex: -1,
      
      toggleSynthesisMode: () => {
        this.synthesisMode = !this.synthesisMode;
        this.synthesisManager.isSynthesisMode = this.synthesisMode;
        console.log(`合成模式 ${this.synthesisMode ? '开启' : '关闭'}`);
        return this.synthesisMode;
      },
      
      handleSynthesisInteraction: (plotIndex, plantData) => {
        // 简化合成逻辑
        if (!this.synthesisMode) return null;
        
        if (this.selectedForSynthesis === null) {
          // 选择第一个植物
          this.selectedForSynthesis = plantData;
          this.selectedPlotForSynthesis = plotIndex;
          console.log(`选择植物 ${plantData?.type} 用于合成`);
          return { action: 'select' };
        } else {
          // 尝试合成
          const result = this.attemptSimpleSynthesis(
            this.selectedPlotForSynthesis, this.selectedForSynthesis,
            plotIndex, plantData
          );
          
          this.selectedForSynthesis = null;
          this.selectedPlotForSynthesis = null;
          
          return result;
        }
      },
      
      getStatus: () => ({
        isSynthesisMode: this.synthesisMode,
        selectedPlant: this.selectedForSynthesis,
        selectedPlotIndex: this.selectedPlotForSynthesis,
        comboStreak: 0,
        comboMultiplier: 1.0
      })
    };
    
    // 初始化合成按钮
    this.addSynthesisButton();
  }
  
  // 尝试简化合成
  attemptSimpleSynthesis(plotIndexA, plantA, plotIndexB, plantB) {
    if (!plantA || !plantB) {
      console.log('合成未成功：植物不存在');
      return { action: 'failed', reason: 'no_plant' };
    }
    
    if (plantA.type !== plantB.type) {
      console.log(`合成未成功：类型不同 ${plantA.type} vs ${plantB.type}`);
      return { action: 'failed', reason: 'type_mismatch' };
    }
    
    if (plantA.state !== 'ready' || plantB.state !== 'ready') {
      console.log('合成未成功：植物未成熟');
      return { action: 'failed', reason: 'not_ready' };
    }
    
    // 简单距离检查（曼哈顿距离）
    const COLS = 6;
    const rowA = Math.floor(plotIndexA / COLS);
    const colA = plotIndexA % COLS;
    const rowB = Math.floor(plotIndexB / COLS);
    const colB = plotIndexB % COLS;
    const distance = Math.abs(rowA - rowB) + Math.abs(colA - colB);
    
    if (distance > 2) {
      console.log(`合成未成功：距离太远 ${distance}`);
      return { action: 'failed', reason: 'too_far' };
    }
    
    // 执行合成
    console.log(`合成成功: ${plotIndexA} + ${plotIndexB} -> ${plantA.type}_lvl2`);
    
    // 这里需要实际合成逻辑，暂时返回成功
    return {
      action: 'success',
      result: {
        success: true,
        resultPlant: {
          type: `${plantA.type}_lvl2`,
          level: 2,
          baseValue: (plantA.baseValue || 10) * 1.5
        }
      }
    };
  }
  
  // 添加合成按钮
  addSynthesisButton() {
    console.log('添加合成按钮到UI（简化实现）');
    // 在实际游戏中，这里会添加Canvas按钮
    // 目前仅记录功能存在
  }
  
  // 创建Canvas
  createCanvas() {
    try {
      if (typeof wx !== 'undefined' && wx.createCanvas) {
        this.canvas = wx.createCanvas();
        this.ctx = this.canvas.getContext('2d');
        console.log('微信环境Canvas创建成功');
      } else if (typeof tt !== 'undefined' && tt.createCanvas) {
        this.canvas = tt.createCanvas();
        this.ctx = this.canvas.getContext('2d');
        console.log('抖音环境Canvas创建成功');
      } else {
        console.warn('无法创建Canvas，使用模拟环境继续运行');
        // 为测试目的创建虚拟Canvas上下文
        this.ctx = {
          fillRect: () => {},
          fillText: () => {},
          fillStyle: '',
          font: '',
          textAlign: '',
          textBaseline: '',
          beginPath: () => {},
          arc: () => {},
          fill: () => {},
          save: () => {},
          restore: () => {},
          translate: () => {},
          rotate: () => {},
          rect: () => {},
          stroke: () => {},
          strokeStyle: '',
          lineWidth: 0
        };
        return;
      }
      
      // 设置Canvas尺寸
      this.canvas.width = this.screenWidth;
      this.canvas.height = this.screenHeight;
      
      console.log(`Canvas尺寸: ${this.screenWidth}x${this.screenHeight}`);
    } catch (error) {
      console.error('Canvas创建未成功：', error);
    }
  }
  
  // 初始化花田网格
  initPlots() {
    this.plots = [];
    
    // 计算花田区域尺寸和位置
    const navBarHeight = this.screenHeight * CONFIG.NAV_BAR_HEIGHT_RATIO;
    const farViewHeight = this.screenHeight * CONFIG.FAR_VIEW_HEIGHT_RATIO;
    const gardenStartY = navBarHeight + farViewHeight;
    const gardenHeight = this.screenHeight * CONFIG.GARDEN_HEIGHT_RATIO;
    const bottomBarHeight = this.screenHeight * CONFIG.BOTTOM_BAR_HEIGHT_RATIO;
    
    // 花田区域边距
    const margin = 12;
    const gardenWidth = this.screenWidth - margin * 2;
    
    // 计算每个花田的尺寸
    const plotWidth = (gardenWidth - (CONFIG.PLOT_COLS - 1) * 8) / CONFIG.PLOT_COLS;
    const plotHeight = (gardenHeight - (CONFIG.PLOT_ROWS - 1) * 12) / CONFIG.PLOT_ROWS;
    
    // 创建花田网格
    let plotIndex = 0;
    for (let row = 0; row < CONFIG.PLOT_ROWS; row++) {
      for (let col = 0; col < CONFIG.PLOT_COLS; col++) {
        const x = margin + col * (plotWidth + 8);
        const y = gardenStartY + row * (plotHeight + 12);
        
        const isUnlocked = plotIndex < GameState.unlockedPlots;
        const flowerData = GameState.flowers[plotIndex];
        
        this.plots.push({
          id: plotIndex,
          x: x,
          y: y,
          width: plotWidth,
          height: plotHeight,
          isUnlocked: isUnlocked,
          flower: flowerData,
          state: flowerData ? flowerData.state : (isUnlocked ? 'empty' : 'locked')
        });
        
        plotIndex++;
      }
    }
    
    console.log(`初始化 ${this.plots.length} 个花田，已解锁 ${GameState.unlockedPlots} 个`);
  }
  
  // 初始化UI按钮
  initUI() {
    // 顶部按钮
    const topButtonWidth = this.screenWidth / CONFIG.TOP_BUTTONS.length;
    const navBarHeight = this.screenHeight * CONFIG.NAV_BAR_HEIGHT_RATIO;
    
    CONFIG.TOP_BUTTONS.forEach((btn, index) => {
      this.topButtons.push({
        id: btn.id,
        x: index * topButtonWidth,
        y: 0,
        width: topButtonWidth,
        height: navBarHeight,
        icon: btn.icon,
        text: btn.text,
        isSelected: false
      });
    });
    
    // 底部按钮
    const bottomButtonWidth = this.screenWidth / CONFIG.BOTTOM_BUTTONS.length;
    const bottomBarY = this.screenHeight * (1 - CONFIG.BOTTOM_BAR_HEIGHT_RATIO);
    
    CONFIG.BOTTOM_BUTTONS.forEach((btn, index) => {
      this.bottomButtons.push({
        id: btn.id,
        x: index * bottomButtonWidth,
        y: bottomBarY,
        width: bottomButtonWidth,
        height: this.screenHeight * CONFIG.BOTTOM_BAR_HEIGHT_RATIO,
        icon: btn.icon,
        text: btn.text
      });
    });
  }
  
  // 开始游戏循环
  startGameLoop() {
    const gameLoop = () => {
      // 更新游戏状态
      GameState.update();
      
      // 渲染游戏
      this.render();
      
      // 请求下一帧
      this.animationFrameId = requestAnimationFrame(gameLoop);
    };
    
    // 使用平台兼容的requestAnimationFrame
    const raf = typeof wx !== 'undefined' ? wx.requestAnimationFrame : 
                typeof tt !== 'undefined' ? tt.requestAnimationFrame :
                requestAnimationFrame;
    
    if (raf) {
      this.animationFrameId = raf(gameLoop);
    } else {
      // 降级到setTimeout
      setInterval(() => {
        GameState.update();
        this.render();
      }, 1000 / 60); // 60fps
    }
  }
  
  // Day10新增：请求重新渲染（用于特效更新）
  requestRender() {
    // 如果已经有动画帧请求，则不需要重复请求
    if (!this.renderRequested) {
      this.renderRequested = true;
      
      // 使用平台兼容的requestAnimationFrame
      const raf = typeof wx !== 'undefined' ? wx.requestAnimationFrame : 
                  typeof tt !== 'undefined' ? tt.requestAnimationFrame :
                  requestAnimationFrame;
      
      if (raf) {
        raf(() => {
          this.renderRequested = false;
          this.render();
        });
      } else {
        // 降级方案：直接渲染
        this.render();
      }
    }
  }
  
  // 渲染游戏场景
  render() {
    if (!this.ctx) return;
    
    const ctx = this.ctx;
    const now = Date.now();
    
    // Day10新增：性能监控更新
    this.updatePerformanceMetrics(now);
    
    // 清空画布
    ctx.clearRect(0, 0, this.screenWidth, this.screenHeight);
    
    // 1. 绘制全屏背景渐变（浅天蓝柔雾→薄荷绿草地）
    this.drawBackground();
    
    // 2. 绘制远景层（花园围栏）
    this.drawFarView();
    
    // 3. 绘制中景层（花土地基 + 石板小径 + 花田）
    this.drawGardenView();
    
    // 4. 绘制前景层（青草地）
    this.drawForeground();
    
    // 5. 绘制顶部导航栏
    this.drawTopNavigation();
    
    // 6. 绘制底部功能栏
    this.drawBottomBar();
    
    // 7. 绘制花田内容
    this.drawPlots();
    
    // 8. 绘制合成特效（Day10新增）
    this.updateAndDrawSynthesisEffects(now);
    
    // 9. 绘制UI按钮
    this.drawButtons();
    
    this.lastRenderTime = now;
  }
  
  // 绘制背景渐变
  drawBackground() {
    const ctx = this.ctx;
    const gradient = ctx.createLinearGradient(0, 0, 0, this.screenHeight);
    
    // 顶部浅天蓝柔雾渐变
    gradient.addColorStop(0, CONFIG.COLORS.SKY_TOP);
    gradient.addColorStop(0.4, CONFIG.COLORS.SKY_BOTTOM);
    
    // 底部薄荷绿草地渐变
    gradient.addColorStop(0.4, CONFIG.COLORS.GRASS_TOP);
    gradient.addColorStop(1, CONFIG.COLORS.GRASS_BOTTOM);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.screenWidth, this.screenHeight);
    
    // 添加手绘肌理效果（简单实现）
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * this.screenWidth;
      const y = Math.random() * this.screenHeight;
      const radius = Math.random() * 3 + 1;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  // 绘制远景层（花园围栏）
  drawFarView() {
    const ctx = this.ctx;
    const navBarHeight = this.screenHeight * CONFIG.NAV_BAR_HEIGHT_RATIO;
    const farViewHeight = this.screenHeight * CONFIG.FAR_VIEW_HEIGHT_RATIO;
    const farViewY = navBarHeight;
    
    // 白色围栏背景
    ctx.fillStyle = CONFIG.COLORS.FENCE;
    ctx.fillRect(0, farViewY, this.screenWidth, farViewHeight);
    
    // 围栏纹理（简单手绘风格）
    ctx.strokeStyle = 'rgba(200, 200, 200, 0.5)';
    ctx.lineWidth = 2;
    
    // 绘制围栏横杆
    for (let i = 0; i < 3; i++) {
      const y = farViewY + (i + 1) * farViewHeight / 4;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.screenWidth, y);
      ctx.stroke();
    }
    
    // 绘制围栏立柱
    const postCount = 10;
    const postWidth = this.screenWidth / postCount;
    for (let i = 0; i <= postCount; i++) {
      const x = i * postWidth;
      ctx.beginPath();
      ctx.moveTo(x, farViewY);
      ctx.lineTo(x, farViewY + farViewHeight);
      ctx.stroke();
    }
    
    // 绘制爬藤月季（简单实现）
    ctx.fillStyle = '#E91E63'; // 粉红色
    for (let i = 0; i < 8; i++) {
      const x = (i + 1) * this.screenWidth / 9;
      const y = farViewY + farViewHeight * 0.3 + Math.sin(i * 0.8) * 5;
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // 绘制小雏菊/满天星点缀
    ctx.fillStyle = '#FFFFFF'; // 白色
    for (let i = 0; i < 15; i++) {
      const x = Math.random() * this.screenWidth;
      const y = farViewY + Math.random() * farViewHeight;
      const radius = Math.random() * 3 + 1;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  // 绘制中景层（花田区）
  drawGardenView() {
    const ctx = this.ctx;
    const navBarHeight = this.screenHeight * CONFIG.NAV_BAR_HEIGHT_RATIO;
    const farViewHeight = this.screenHeight * CONFIG.FAR_VIEW_HEIGHT_RATIO;
    const gardenStartY = navBarHeight + farViewHeight;
    const gardenHeight = this.screenHeight * CONFIG.GARDEN_HEIGHT_RATIO;
    
    // 暖棕色花土地基
    ctx.fillStyle = CONFIG.COLORS.SOIL;
    ctx.fillRect(0, gardenStartY, this.screenWidth, gardenHeight);
    
    // 泥土肌理
    ctx.fillStyle = CONFIG.COLORS.SOIL_TEXTURE;
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * this.screenWidth;
      const y = gardenStartY + Math.random() * gardenHeight;
      const size = Math.random() * 3 + 1;
      ctx.fillRect(x, y, size, size);
    }
    
    // 浅米色石板小径分隔
    ctx.fillStyle = CONFIG.COLORS.PATH;
    const pathWidth = 4;
    
    // 水平小径（行间）
    for (let row = 1; row < CONFIG.PLOT_ROWS; row++) {
      const y = gardenStartY + row * (gardenHeight / CONFIG.PLOT_ROWS) - 6;
      ctx.fillRect(0, y, this.screenWidth, pathWidth);
    }
    
    // 垂直小径（列间）
    for (let col = 1; col < CONFIG.PLOT_COLS; col++) {
      const x = col * (this.screenWidth / CONFIG.PLOT_COLS) - 4;
      ctx.fillRect(x, gardenStartY, pathWidth, gardenHeight);
    }
  }
  
  // 绘制前景层（青草地）
  drawForeground() {
    const ctx = this.ctx;
    const foregroundY = this.screenHeight * (1 - CONFIG.FOREGROUND_HEIGHT_RATIO - CONFIG.BOTTOM_BAR_HEIGHT_RATIO);
    const foregroundHeight = this.screenHeight * CONFIG.FOREGROUND_HEIGHT_RATIO;
    
    // 青草地
    ctx.fillStyle = CONFIG.COLORS.FOREGROUND_GRASS;
    ctx.fillRect(0, foregroundY, this.screenWidth, foregroundHeight);
    
    // 三叶草点缀
    ctx.fillStyle = '#4CAF50'; // 深绿色
    for (let i = 0; i < 10; i++) {
      const x = Math.random() * this.screenWidth;
      const y = foregroundY + Math.random() * foregroundHeight;
      this.drawClover(ctx, x, y, 5);
    }
    
    // 蒲公英点缀
    ctx.fillStyle = '#FFFFFF'; // 白色
    for (let i = 0; i < 8; i++) {
      const x = Math.random() * this.screenWidth;
      const y = foregroundY + Math.random() * foregroundHeight;
      this.drawDandelion(ctx, x, y, 4);
    }
  }
  
  // 绘制三叶草
  drawClover(ctx, x, y, size) {
    ctx.save();
    ctx.translate(x, y);
    
    // 三个叶片
    for (let i = 0; i < 3; i++) {
      const angle = (i * 120 * Math.PI) / 180;
      ctx.save();
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.ellipse(size, 0, size, size * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    
    // 茎
    ctx.fillStyle = '#388E3C';
    ctx.fillRect(-1, 0, 2, size * 2);
    
    ctx.restore();
  }
  
  // 绘制蒲公英
  drawDandelion(ctx, x, y, size) {
    ctx.save();
    ctx.translate(x, y);
    
    // 蒲公英种子球
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fill();
    
    // 种子伞
    for (let i = 0; i < 8; i++) {
      const angle = (i * 45 * Math.PI) / 180;
      const length = size * 3;
      
      ctx.save();
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -length);
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // 伞状末端
      ctx.beginPath();
      ctx.arc(0, -length, size * 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    
    ctx.restore();
  }
  
  // 绘制顶部导航栏
  drawTopNavigation() {
    const ctx = this.ctx;
    const navBarHeight = this.screenHeight * CONFIG.NAV_BAR_HEIGHT_RATIO;
    
    // 半透明白色圆角背景
    ctx.fillStyle = CONFIG.COLORS.BUTTON_BG;
    this.drawRoundedRect(ctx, 12, 0, this.screenWidth - 24, navBarHeight, 10);
    ctx.fill();
    
    // 绘制按钮分隔线
    ctx.strokeStyle = 'rgba(200, 200, 200, 0.3)';
    ctx.lineWidth = 1;
    
    const buttonWidth = (this.screenWidth - 24) / CONFIG.TOP_BUTTONS.length;
    for (let i = 1; i < CONFIG.TOP_BUTTONS.length; i++) {
      const x = 12 + i * buttonWidth;
      ctx.beginPath();
      ctx.moveTo(x, navBarHeight * 0.2);
      ctx.lineTo(x, navBarHeight * 0.8);
      ctx.stroke();
    }
  }
  
  // 绘制底部功能栏
  drawBottomBar() {
    const ctx = this.ctx;
    const bottomBarY = this.screenHeight * (1 - CONFIG.BOTTOM_BAR_HEIGHT_RATIO);
    const bottomBarHeight = this.screenHeight * CONFIG.BOTTOM_BAR_HEIGHT_RATIO;
    
    // 半透明白色圆角背景
    ctx.fillStyle = CONFIG.COLORS.BUTTON_BG;
    this.drawRoundedRect(ctx, 12, bottomBarY, this.screenWidth - 24, bottomBarHeight, 10);
    ctx.fill();
  }
  
  // 绘制花田
  drawPlots() {
    this.plots.forEach(plot => {
      this.drawPlot(plot);
    });
  }
  
  // 绘制单个花田
  drawPlot(plot) {
    const ctx = this.ctx;
    
    ctx.save();
    
    if (!plot.isUnlocked) {
      // 锁定状态：浅灰色磨砂质感
      ctx.fillStyle = CONFIG.COLORS.PLOT_LOCKED;
      this.drawRoundedRect(ctx, plot.x, plot.y, plot.width, plot.height, 8);
      ctx.fill();
      
      // 描边
      ctx.strokeStyle = 'rgba(189, 189, 189, 0.8)';
      ctx.lineWidth = 1;
      this.drawRoundedRect(ctx, plot.x, plot.y, plot.width, plot.height, 8);
      ctx.stroke();
      
      // 金色锁图标
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 32px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🔒', plot.x + plot.width / 2, plot.y + plot.height / 2 - 10);
      
      // 解锁等级文字
      ctx.fillStyle = CONFIG.COLORS.TEXT_GRAY;
      ctx.font = '12px sans-serif';
      ctx.fillText(`需${Math.ceil(plot.id / 6) + 1}级解锁`, plot.x + plot.width / 2, plot.y + plot.height - 15);
      
    } else if (plot.state === 'empty') {
      // 可种花状态：暖棕色花土地
      ctx.fillStyle = CONFIG.COLORS.SOIL;
      this.drawRoundedRect(ctx, plot.x, plot.y, plot.width, plot.height, 8);
      ctx.fill();
      
      // 泥土肌理细节
      ctx.fillStyle = CONFIG.COLORS.SOIL_TEXTURE;
      for (let i = 0; i < 10; i++) {
        const x = plot.x + Math.random() * plot.width;
        const y = plot.y + Math.random() * plot.height;
        ctx.fillRect(x, y, 2, 2);
      }
      
      // 描边
      ctx.strokeStyle = CONFIG.COLORS.PLOT_BORDER;
      ctx.lineWidth = 1;
      this.drawRoundedRect(ctx, plot.x, plot.y, plot.width, plot.height, 8);
      ctx.stroke();
      
      // 可种花文字
      ctx.fillStyle = CONFIG.COLORS.TEXT_GREEN;
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('可种花', plot.x + plot.width / 2, plot.y + plot.height / 2);
      
      // 四角青草点缀
      ctx.fillStyle = '#388E3C';
      const grassSize = 3;
      const corners = [
        [plot.x + grassSize, plot.y + grassSize],
        [plot.x + plot.width - grassSize, plot.y + grassSize],
        [plot.x + grassSize, plot.y + plot.height - grassSize],
        [plot.x + plot.width - grassSize, plot.y + plot.height - grassSize]
      ];
      
      corners.forEach(([x, y]) => {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - grassSize, y + grassSize * 2);
        ctx.lineTo(x + grassSize, y + grassSize * 2);
        ctx.closePath();
        ctx.fill();
      });
      
    } else if (plot.state === 'growing') {
      // 生长中状态
      ctx.fillStyle = CONFIG.COLORS.SOIL;
      this.drawRoundedRect(ctx, plot.x, plot.y, plot.width, plot.height, 8);
      ctx.fill();
      
      // 描边
      ctx.strokeStyle = CONFIG.COLORS.PLOT_BORDER;
      ctx.lineWidth = 1;
      this.drawRoundedRect(ctx, plot.x, plot.y, plot.width, plot.height, 8);
      ctx.stroke();
      
      // 绘制花卉生长动画
      this.drawGrowingFlower(plot);
      
      // 剩余时间进度条
      if (plot.flower && plot.flower.progress < 1) {
        const progress = plot.flower.progress || 0;
        const barWidth = plot.width * 0.8;
        const barX = plot.x + (plot.width - barWidth) / 2;
        const barY = plot.y + plot.height - 20;
        const barHeight = 6;
        
        // 进度条背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // 进度条前景
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(barX, barY, barWidth * progress, barHeight);
        
        // 剩余时间文字
        const remainingTime = plot.flower.growthTime * (1 - progress);
        const minutes = Math.ceil(remainingTime / 60);
        ctx.fillStyle = CONFIG.COLORS.TEXT_GRAY;
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${minutes}分钟后开花`, plot.x + plot.width / 2, barY - 3);
      }
      
    } else if (plot.state === 'ready') {
      // 可收获状态
      ctx.fillStyle = CONFIG.COLORS.SOIL;
      this.drawRoundedRect(ctx, plot.x, plot.y, plot.width, plot.height, 8);
      ctx.fill();
      
      // 金色光环呼吸动画
      const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 500);
      ctx.strokeStyle = `rgba(255, 215, 0, ${pulse * 0.8})`;
      ctx.lineWidth = 3;
      this.drawRoundedRect(ctx, plot.x - 2, plot.y - 2, plot.width + 4, plot.height + 4, 10);
      ctx.stroke();
      
      // 描边
      ctx.strokeStyle = CONFIG.COLORS.PLOT_BORDER;
      ctx.lineWidth = 1;
      this.drawRoundedRect(ctx, plot.x, plot.y, plot.width, plot.height, 8);
      ctx.stroke();
      
      // 绘制盛开的花卉
      if (plot.flower) {
        this.drawBloomFlower(plot);
      }
      
      // 可收获文字（带呼吸动画）
      ctx.fillStyle = CONFIG.COLORS.TEXT_RED;
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      const textAlpha = 0.7 + 0.3 * Math.sin(Date.now() / 300);
      ctx.globalAlpha = textAlpha;
      ctx.fillText('可收获', plot.x + plot.width / 2, plot.y + plot.height - 15);
      ctx.globalAlpha = 1;
      
    } else if (plot.state === 'withered') {
      // 枯萎可清理状态
      ctx.fillStyle = '#A1887F'; // 灰褐色
      this.drawRoundedRect(ctx, plot.x, plot.y, plot.width, plot.height, 8);
      ctx.fill();
      
      // 描边
      ctx.strokeStyle = '#6D4C41';
      ctx.lineWidth = 1;
      this.drawRoundedRect(ctx, plot.x, plot.y, plot.width, plot.height, 8);
      ctx.stroke();
      
      // 枯萎花茎
      ctx.strokeStyle = '#5D4037';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(plot.x + plot.width / 2, plot.y + plot.height);
      ctx.lineTo(plot.x + plot.width / 2, plot.y + plot.height / 2);
      ctx.stroke();
      
      // 枯萎花朵（下垂）
      ctx.fillStyle = '#8D6E63';
      ctx.beginPath();
      ctx.ellipse(plot.x + plot.width / 2, plot.y + plot.height / 2 - 10, 10, 5, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();
      
      // 可清理文字
      ctx.fillStyle = CONFIG.COLORS.TEXT_GRAY;
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('可清理', plot.x + plot.width / 2, plot.y + plot.height - 15);
    }
    
    // Day10新增：绘制合成高亮效果
    if (this.highlightedPlotIndex === plot.id) {
      this.drawSynthesisHighlight(plot);
    }
    
    ctx.restore();
  }
  
  // Day10新增：绘制合成选择高亮效果
  drawSynthesisHighlight(plot) {
    const ctx = this.ctx;
    
    // 更新脉冲相位，实现呼吸动画
    this.highlightPulsePhase += 0.05; // 较慢的动画速度
    if (this.highlightPulsePhase > Math.PI * 2) {
      this.highlightPulsePhase = 0;
    }
    
    // 计算呼吸动画强度 (0.3 ~ 0.8)
    const pulse = 0.3 + 0.5 * Math.sin(this.highlightPulsePhase);
    
    ctx.save();
    
    // 绘制外发光效果（多层叠加实现柔和发光）
    for (let i = 0; i < 3; i++) {
      const offset = i * 2;
      const alpha = pulse * 0.2 * (1 - i / 3);
      
      ctx.strokeStyle = `rgba(100, 200, 255, ${alpha})`; // 天蓝色发光
      ctx.lineWidth = 3 + i;
      
      // 绘制圆角矩形边框
      const borderRadius = 8 + offset;
      const x = plot.x - offset - 2;
      const y = plot.y - offset - 2;
      const width = plot.width + offset * 2 + 4;
      const height = plot.height + offset * 2 + 4;
      
      this.drawRoundedRect(ctx, x, y, width, height, borderRadius);
      ctx.stroke();
    }
    
    // 绘制内发光边框（更明显）
    ctx.strokeStyle = `rgba(100, 200, 255, ${pulse * 0.6})`;
    ctx.lineWidth = 2;
    this.drawRoundedRect(ctx, plot.x - 1, plot.y - 1, plot.width + 2, plot.height + 2, 10);
    ctx.stroke();
    
    // 绘制四个角的装饰性星星
    const starSize = 4 + pulse * 2;
    const corners = [
      [plot.x - 5, plot.y - 5],
      [plot.x + plot.width + 5, plot.y - 5],
      [plot.x - 5, plot.y + plot.height + 5],
      [plot.x + plot.width + 5, plot.y + plot.height + 5]
    ];
    
    ctx.fillStyle = `rgba(255, 255, 100, ${pulse * 0.8})`; // 淡黄色星星
    
    corners.forEach(([x, y]) => {
      ctx.save();
      ctx.translate(x, y);
      
      // 绘制五角星
      ctx.beginPath();
      const spikes = 5;
      const outerRadius = starSize;
      const innerRadius = starSize * 0.5;
      
      for (let i = 0; i < spikes * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (Math.PI / spikes) * i;
        const px = Math.cos(angle) * radius;
        const py = Math.sin(angle) * radius;
        
        if (i === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }
      
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });
    
    ctx.restore();
  }
  
  // 绘制生长中的花卉
  drawGrowingFlower(plot) {
    if (!plot.flower) return;
    
    const ctx = this.ctx;
    const centerX = plot.x + plot.width / 2;
    const centerY = plot.y + plot.height / 2 - 10;
    const progress = plot.flower.progress || 0;
    
    // 根据进度绘制不同生长阶段
    const flowerType = CONFIG.FLOWER_TYPES.find(f => f.id === plot.flower.type) || CONFIG.FLOWER_TYPES[0];
    const growthStage = Math.floor(progress * 5); // 0-4阶段
    
    ctx.save();
    ctx.translate(centerX, centerY);
    
    // 茎
    ctx.strokeStyle = '#388E3C';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 10);
    ctx.lineTo(0, -20 * progress);
    ctx.stroke();
    
    // 根据阶段绘制花卉
    ctx.fillStyle = flowerType.color;
    
    if (growthStage >= 1) {
      // 阶段1-4：花蕾到盛开
      const size = 5 + growthStage * 3;
      const petalCount = 3 + growthStage * 2;
      
      // 绘制花瓣
      for (let i = 0; i < petalCount; i++) {
        const angle = (i * 2 * Math.PI) / petalCount;
        const petalX = Math.cos(angle) * size;
        const petalY = Math.sin(angle) * size;
        
        ctx.save();
        ctx.translate(petalX, petalY);
        ctx.rotate(angle);
        
        ctx.beginPath();
        ctx.ellipse(0, 0, size * 0.6, size * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
      }
      
      // 花心
      ctx.fillStyle = '#FF9800';
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // 阶段0：小花蕾
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  }
  
  // 绘制盛开的花卉
  drawBloomFlower(plot) {
    if (!plot.flower) return;
    
    const ctx = this.ctx;
    const centerX = plot.x + plot.width / 2;
    const centerY = plot.y + plot.height / 2 - 15;
    
    const flowerType = CONFIG.FLOWER_TYPES.find(f => f.id === plot.flower.type) || CONFIG.FLOWER_TYPES[0];
    const size = 15;
    
    ctx.save();
    ctx.translate(centerX, centerY);
    
    // 轻微摆动动画
    const swing = Math.sin(Date.now() / 1000) * 0.1;
    ctx.rotate(swing);
    
    // 茎
    ctx.strokeStyle = '#388E3C';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 15);
    ctx.lineTo(0, -10);
    ctx.stroke();
    
    // 叶子
    ctx.fillStyle = '#4CAF50';
    ctx.beginPath();
    ctx.ellipse(-8, 5, 6, 3, -Math.PI / 6, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.ellipse(8, 5, 6, 3, Math.PI / 6, 0, Math.PI * 2);
    ctx.fill();
    
    // 花瓣
    ctx.fillStyle = flowerType.color;
    const petalCount = 8;
    
    for (let i = 0; i < petalCount; i++) {
      const angle = (i * 2 * Math.PI) / petalCount;
      const petalX = Math.cos(angle) * size;
      const petalY = Math.sin(angle) * size;
      
      ctx.save();
      ctx.translate(petalX, petalY);
      ctx.rotate(angle);
      
      ctx.beginPath();
      ctx.ellipse(0, 0, size * 0.6, size * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    }
    
    // 花心
    ctx.fillStyle = '#FF9800';
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.4, 0, Math.PI * 2);
    ctx.fill();
    
    // 花心细节
    ctx.fillStyle = '#FF5722';
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const dotX = Math.cos(angle) * size * 0.2;
      const dotY = Math.sin(angle) * size * 0.2;
      ctx.beginPath();
      ctx.arc(dotX, dotY, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // 花瓣飘落效果（仅当最近被收获时）
    if (plot.flower.lastHarvestTime && Date.now() - plot.flower.lastHarvestTime < 1000) {
      for (let i = 0; i < 5; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 20;
        const petalX = Math.cos(angle) * distance;
        const petalY = Math.sin(angle) * distance + 10;
        
        ctx.save();
        ctx.translate(petalX, petalY);
        ctx.rotate(Math.random() * Math.PI);
        
        ctx.fillStyle = flowerType.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, 3, 2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
      }
    }
    
    ctx.restore();
  }
  
  // 绘制UI按钮
  drawButtons() {
    const ctx = this.ctx;
    const now = Date.now();
    
    // 顶部按钮
    this.topButtons.forEach(btn => {
      const btnCenterX = btn.x + btn.width / 2;
      const btnCenterY = btn.y + btn.height / 2;
      
      // 按钮选中状态高亮
      if (btn.isSelected) {
        ctx.fillStyle = CONFIG.COLORS.BUTTON_HIGHLIGHT;
        this.drawRoundedRect(ctx, btn.x + 5, btn.y + 5, btn.width - 10, btn.height - 10, 8);
        ctx.fill();
      }
      
      // 图标
      ctx.fillStyle = CONFIG.COLORS.BUTTON_TEXT;
      ctx.font = '24px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(btn.icon, btnCenterX, btnCenterY - 10);
      
      // 文字
      ctx.font = '14px sans-serif';
      ctx.fillText(btn.text, btnCenterX, btnCenterY + 15);
    });
    
    // 底部按钮
    this.bottomButtons.forEach(btn => {
      const btnCenterX = btn.x + btn.width / 2;
      const btnCenterY = btn.y + btn.height / 2;
      
      // 薄荷绿渐变圆角按钮
      const gradient = ctx.createLinearGradient(btn.x, btn.y, btn.x, btn.y + btn.height);
      gradient.addColorStop(0, '#A5D6A7');
      gradient.addColorStop(1, '#81C784');
      
      ctx.fillStyle = gradient;
      this.drawRoundedRect(ctx, btn.x + 8, btn.y + 8, btn.width - 16, btn.height - 16, 15);
      ctx.fill();
      
      // 图标
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '20px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(btn.icon, btnCenterX, btnCenterY - 10);
      
      // 文字
      ctx.font = '14px sans-serif';
      ctx.fillText(btn.text, btnCenterX, btnCenterY + 15);
    });
  }
  
  // 绘制圆角矩形
  drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }
  
  // 处理触摸事件
  handleTouchStart(x, y) {
    // 检查顶部按钮
    this.topButtons.forEach(btn => {
      if (this.isPointInRect(x, y, btn.x, btn.y, btn.width, btn.height)) {
        console.log(`点击顶部按钮: ${btn.text}`);
        btn.isSelected = !btn.isSelected;
        
        // 按钮点击缩放反馈（视觉上通过重绘实现）
        this.handleButtonClick(btn.id);
        return;
      }
    });
    
    // 检查底部按钮
    this.bottomButtons.forEach(btn => {
      if (this.isPointInRect(x, y, btn.x, btn.y, btn.width, btn.height)) {
        console.log(`点击底部按钮: ${btn.text}`);
        this.handleBottomButtonClick(btn.id);
        return;
      }
    });
    
    // 检查花田
    for (const plot of this.plots) {
      if (this.isPointInRect(x, y, plot.x, plot.y, plot.width, plot.height)) {
        console.log(`点击花田 ${plot.id}, 状态: ${plot.state}`);
        
        // 合成模式处理（Day9新增）
        if (this.synthesisMode && this.synthesisManager) {
          const plantData = plot.flower;
          const synthesisResult = this.synthesisManager.handleSynthesisInteraction(plot.id, plantData);
          
          if (synthesisResult) {
            console.log('合成交互结果:', synthesisResult.action);
            
            // 处理合成结果
            if (synthesisResult.action === 'success' && synthesisResult.result?.success) {
              this.handleSynthesisSuccess(synthesisResult.result);
            }
            
            // 如果是选择操作，更新视觉反馈
            if (synthesisResult.action === 'select') {
              this.highlightPlotForSynthesis(plot.id);
            }
            
            return;
          }
        }
        
        // 普通模式处理
        this.handlePlotClick(plot);
        return;
      }
    }
  }
  
  // 检查点是否在矩形内
  isPointInRect(x, y, rectX, rectY, rectWidth, rectHeight) {
    return x >= rectX && x <= rectX + rectWidth && 
           y >= rectY && y <= rectY + rectHeight;
  }
  
  // 处理按钮点击
  handleButtonClick(buttonId) {
    switch (buttonId) {
      case 'seeds':
        this.showSeedPanel();
        break;
      case 'album':
        this.showFlowerAlbum();
        break;
      case 'decorate':
        this.showDecorationShop();
        break;
      case 'backpack':
        this.showBackpack();
        break;
      case 'friends':
        this.showFriends();
        break;
    }
  }
  
  // 处理底部按钮点击
  handleBottomButtonClick(buttonId) {
    switch (buttonId) {
      case 'harvestAll':
        this.harvestAll();
        break;
      case 'cleanAll':
        this.cleanAll();
        break;
      case 'synthesis':
        this.toggleSynthesisMode();
        break;
      case 'settings':
        this.showSettings();
        break;
    }
  }
  
  // 处理合成成功（Day9新增）
  handleSynthesisSuccess(synthesisResult) {
    console.log('处理合成成功:', synthesisResult);
    
    try {
      // 更新游戏状态
      if (synthesisResult.reward && GameState) {
        GameState.coins += synthesisResult.reward;
        GameState.exp += Math.floor(synthesisResult.reward / 2);
        
        // 检查升级
        if (GameState.exp >= GameState.expToNextLevel) {
          GameState.level++;
          GameState.exp -= GameState.expToNextLevel;
          GameState.expToNextLevel = Math.floor(GameState.expToNextLevel * 1.5);
          console.log(`升级到 Lv.${GameState.level} (合成奖励)`);
        }
      }
      
      // 更新植物状态
      if (synthesisResult.resultPlant && synthesisResult.updatedPlotIndex !== undefined) {
        const plotIndex = synthesisResult.updatedPlotIndex;
        if (this.plots[plotIndex]) {
          // 更新植物数据
          this.plots[plotIndex].flower = synthesisResult.resultPlant;
          this.plots[plotIndex].state = 'growing';
          
          // 更新GameState
          if (GameState.flowers) {
            GameState.flowers[plotIndex] = synthesisResult.resultPlant;
          }
        }
      }
      
      // 删除被合成的植物
      if (synthesisResult.removedPlotIndices) {
        synthesisResult.removedPlotIndices.forEach(plotIndex => {
          if (this.plots[plotIndex]) {
            this.plots[plotIndex].flower = null;
            this.plots[plotIndex].state = 'empty';
            
            if (GameState.flowers) {
              delete GameState.flowers[plotIndex];
            }
          }
        });
      }
      
      // 显示合成成功消息
      this.showMessage(`合成成功！获得 ${synthesisResult.reward || 0} 金币`, 'success');
      
      // 播放音效
      this.playSound('synthesis');
      
      // 保存游戏状态
      if (GameState.save) {
        GameState.save();
      }
      
      // 如果合成状态管理器存在，也保存合成状态
      if (SynthesisState && SynthesisState.save) {
        SynthesisState.save();
      }
      
    } catch (error) {
      console.error('处理合成成功时出错:', error);
      this.showMessage('合成处理出错，请重试', 'error');
    }
  }
  
  // 高亮地块用于合成（Day9新增，Day10完善）
  highlightPlotForSynthesis(plotIndex) {
    console.log(`高亮地块 ${plotIndex} 用于合成`);
    
    // 清除之前的高亮
    if (this.highlightedPlotIndex !== -1 && this.highlightedPlotIndex !== plotIndex) {
      // 可以在这里添加清除特效的逻辑
    }
    
    // 设置高亮的地块索引
    this.highlightedPlotIndex = plotIndex;
    
    // 重置脉冲相位，开始高亮动画
    this.highlightPulsePhase = 0;
    
    // 触发重绘以显示高亮效果
    this.requestRender();
  }
  
  // Day10新增：为合成管理器提供兼容方法
  highlightPlot(plotIndex, highlight) {
    if (highlight) {
      this.highlightPlotForSynthesis(plotIndex);
    } else {
      // 清除高亮
      this.highlightedPlotIndex = -1;
      this.requestRender();
    }
  }
  
  // Day10新增：合成成功特效
  playSynthesisEffect(sourcePlotIndex, targetPlotIndex, resultPlant) {
    console.log(`播放合成成功特效: ${sourcePlotIndex} + ${targetPlotIndex} -> ${resultPlant.type}`);
    
    // 清除之前的高亮
    this.highlightedPlotIndex = -1;
    
    // 获取两个地块的位置信息
    const sourcePlot = this.plots[sourcePlotIndex];
    const targetPlot = this.plots[targetPlotIndex];
    
    if (!sourcePlot || !targetPlot) {
      console.warn('无法播放合成特效：地块不存在');
      return;
    }
    
    // 创建合成特效对象
    const effect = {
      type: 'synthesis_success',
      sourcePlotIndex: sourcePlotIndex,
      targetPlotIndex: targetPlotIndex,
      resultPlant: resultPlant,
      startTime: Date.now(),
      duration: 1500, // 1.5秒特效
      phase: 0,
      particles: []
    };
    
    // 初始化粒子效果
    this.initSynthesisParticles(effect, sourcePlot, targetPlot);
    
    // 添加到特效队列
    this.synthesisEffects.push(effect);
    
    // 显示合成成功消息
    this.showMessage(`合成成功！获得 ${resultPlant.type}`, 'success');
    
    // 播放音效（如果有）
    if (this.playSound) {
      this.playSound('synthesis_success');
    }
    
    // 触发渲染以显示特效
    this.requestRender();
  }
  
  // Day10新增：初始化合成粒子效果
  initSynthesisParticles(effect, sourcePlot, targetPlot) {
    const particleCount = 30;
    const sourceCenterX = sourcePlot.x + sourcePlot.width / 2;
    const sourceCenterY = sourcePlot.y + sourcePlot.height / 2;
    const targetCenterX = targetPlot.x + targetPlot.width / 2;
    const targetCenterY = targetPlot.y + targetPlot.height / 2;
    
    for (let i = 0; i < particleCount; i++) {
      // 粒子从源位置飞向目标位置
      const progress = i / particleCount;
      const x = sourceCenterX + (targetCenterX - sourceCenterX) * progress;
      const y = sourceCenterY + (targetCenterY - sourceCenterY) * progress;
      
      // 随机偏移，增加自然感
      const offsetX = (Math.random() - 0.5) * 20;
      const offsetY = (Math.random() - 0.5) * 20;
      
      effect.particles.push({
        x: x + offsetX,
        y: y + offsetY,
        size: Math.random() * 4 + 2,
        speed: Math.random() * 2 + 1,
        color: this.getParticleColorForPlant(effect.resultPlant),
        life: 1.0,
        decay: Math.random() * 0.02 + 0.01
      });
    }
  }
  
  // Day10新增：根据植物类型获取粒子颜色
  getParticleColorForPlant(plant) {
    const flowerType = CONFIG.FLOWER_TYPES.find(f => f.id === plant.type);
    if (flowerType && flowerType.color) {
      return flowerType.color;
    }
    
    // 默认粒子颜色（金色）
    return '#FFD700';
  }
  
  // Day10新增：更新和绘制合成特效
  updateAndDrawSynthesisEffects(currentTime) {
    if (!this.ctx || this.synthesisEffects.length === 0) return;
    
    const ctx = this.ctx;
    
    // 更新特效状态
    for (let i = this.synthesisEffects.length - 1; i >= 0; i--) {
      const effect = this.synthesisEffects[i];
      const elapsed = currentTime - effect.startTime;
      
      // 计算特效进度 (0到1)
      effect.phase = Math.min(elapsed / effect.duration, 1);
      
      // 更新粒子效果
      this.updateSynthesisParticles(effect, currentTime);
      
      // 绘制特效
      this.drawSynthesisEffect(effect, ctx);
      
      // 如果特效结束，移除它
      if (effect.phase >= 1) {
        this.synthesisEffects.splice(i, 1);
      }
    }
    
    // 如果有活跃特效，请求下一帧渲染
    if (this.synthesisEffects.length > 0) {
      this.requestRender();
    }
  }
  
  // Day10新增：更新合成粒子
  updateSynthesisParticles(effect, currentTime) {
    if (!effect.particles || effect.particles.length === 0) return;
    
    for (let i = effect.particles.length - 1; i >= 0; i--) {
      const particle = effect.particles[i];
      
      // 更新粒子生命值
      particle.life -= particle.decay;
      
      // 更新粒子位置（向目标移动）
      const targetPlot = this.plots[effect.targetPlotIndex];
      if (targetPlot) {
        const targetX = targetPlot.x + targetPlot.width / 2;
        const targetY = targetPlot.y + targetPlot.height / 2;
        
        const dx = targetX - particle.x;
        const dy = targetY - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 5) {
          // 向目标移动
          particle.x += (dx / distance) * particle.speed;
          particle.y += (dy / distance) * particle.speed;
        }
      }
      
      // 如果粒子生命结束，移除它
      if (particle.life <= 0) {
        effect.particles.splice(i, 1);
      }
    }
  }
  
  // Day10新增：绘制合成特效
  drawSynthesisEffect(effect, ctx) {
    if (effect.type !== 'synthesis_success' || !effect.particles) return;
    
    // 绘制连接线（源地块到目标地块）
    const sourcePlot = this.plots[effect.sourcePlotIndex];
    const targetPlot = this.plots[effect.targetPlotIndex];
    
    if (!sourcePlot || !targetPlot) return;
    
    const sourceX = sourcePlot.x + sourcePlot.width / 2;
    const sourceY = sourcePlot.y + sourcePlot.height / 2;
    const targetX = targetPlot.x + targetPlot.width / 2;
    const targetY = targetPlot.y + targetPlot.height / 2;
    
    // 绘制连接线（渐隐效果）
    const lineAlpha = 0.7 * (1 - effect.phase);
    ctx.save();
    ctx.strokeStyle = `rgba(100, 200, 255, ${lineAlpha})`;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(sourceX, sourceY);
    ctx.lineTo(targetX, targetY);
    ctx.stroke();
    ctx.restore();
    
    // 绘制粒子
    effect.particles.forEach(particle => {
      ctx.save();
      ctx.fillStyle = particle.color;
      ctx.globalAlpha = particle.life * 0.8;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * particle.life, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    
    // 绘制目标地块的接收效果
    if (effect.phase > 0.3 && effect.phase < 0.9) {
      const pulse = 0.5 + 0.5 * Math.sin(effect.phase * Math.PI * 4);
      const radius = 20 + pulse * 10;
      
      ctx.save();
      ctx.strokeStyle = `rgba(255, 215, 0, ${pulse * 0.7})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(targetX, targetY, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }
  
  // Day10新增：更新性能指标
  updatePerformanceMetrics(currentTime) {
    if (!this.performanceMonitor.enabled) return;
    
    const monitor = this.performanceMonitor;
    
    // 记录帧时间
    if (monitor.lastFrameTime) {
      const frameTime = currentTime - monitor.lastFrameTime;
      monitor.frameTimes.push(frameTime);
      
      // 更新统计
      monitor.maxFrameTime = Math.max(monitor.maxFrameTime, frameTime);
      monitor.minFrameTime = Math.min(monitor.minFrameTime, frameTime);
      
      // 保持最近60帧的记录
      if (monitor.frameTimes.length > 60) {
        monitor.frameTimes.shift();
      }
      
      // 计算平均帧时间
      const sum = monitor.frameTimes.reduce((a, b) => a + b, 0);
      monitor.averageFrameTime = sum / monitor.frameTimes.length;
    }
    
    monitor.lastFrameTime = currentTime;
    monitor.frameCount++;
    
    // 每秒更新FPS
    if (currentTime - monitor.lastFpsUpdate >= 1000) {
      monitor.currentFps = Math.round((monitor.frameCount * 1000) / (currentTime - monitor.lastFpsUpdate));
      monitor.frameCount = 0;
      monitor.lastFpsUpdate = currentTime;
      
      // 输出性能报告（开发模式）
      if (monitor.currentFps < 30) {
        console.warn(`性能警告: FPS = ${monitor.currentFps}, 平均帧时间 = ${monitor.averageFrameTime.toFixed(2)}ms`);
      }
    }
  }
  
  // Day10新增：启用/禁用性能监控
  togglePerformanceMonitor(enable) {
    this.performanceMonitor.enabled = enable;
    
    if (enable) {
      // 重置监控器
      this.performanceMonitor.frameCount = 0;
      this.performanceMonitor.lastFpsUpdate = Date.now();
      this.performanceMonitor.frameTimes = [];
      this.performanceMonitor.maxFrameTime = 0;
      this.performanceMonitor.minFrameTime = 1000;
      this.performanceMonitor.averageFrameTime = 0;
      
      console.log('性能监控已启用');
    } else {
      console.log('性能监控已禁用');
    }
  }
  
  // Day10新增：获取性能报告
  getPerformanceReport() {
    if (!this.performanceMonitor.enabled) {
      return '性能监控未启用';
    }
    
    const monitor = this.performanceMonitor;
    const fps = monitor.currentFps;
    const avgFrameTime = monitor.averageFrameTime.toFixed(2);
    const minFrameTime = monitor.minFrameTime.toFixed(2);
    const maxFrameTime = monitor.maxFrameTime.toFixed(2);
    const activeEffects = this.synthesisEffects.length;
    const highlighted = this.highlightedPlotIndex !== -1 ? '是' : '否';
    
    return `性能报告:
  FPS: ${fps} (目标: 60)
  平均帧时间: ${avgFrameTime}ms
  最小帧时间: ${minFrameTime}ms
  最大帧时间: ${maxFrameTime}ms
  活跃特效: ${activeEffects}
  高亮地块: ${highlighted}
  合成模式: ${this.synthesisMode ? '开启' : '关闭'}`;
  }
  
  // 切换合成模式（Day9新增）
  toggleSynthesisMode() {
    // 检查等级要求
    if (GameState && GameState.level < 2) {
      this.showMessage('需要达到2级才能使用合成功能！', 'warning');
      return false;
    }
    
    this.synthesisMode = !this.synthesisMode;
    
    if (this.synthesisManager && this.synthesisManager.toggleSynthesisMode) {
      this.synthesisManager.toggleSynthesisMode();
    }
    
    console.log(`合成模式 ${this.synthesisMode ? '开启' : '关闭'}`);
    
    // 显示提示
    if (this.synthesisMode) {
      this.showMessage('合成模式已开启！请选择一个植物', 'info');
    } else {
      this.showMessage('合成模式已关闭', 'info');
      this.selectedForSynthesis = null;
      this.selectedPlotForSynthesis = null;
      // Day10新增：清除高亮效果
      this.highlightedPlotIndex = -1;
    }
    
    return this.synthesisMode;
  }
  
  // 处理花田点击
  handlePlotClick(plot) {
    if (!plot.isUnlocked) {
      this.showUnlockRequirement(plot);
      return;
    }
    
    switch (plot.state) {
      case 'empty':
        if (this.selectedSeed) {
          this.plantFlower(plot, this.selectedSeed);
        } else {
          this.showSeedPanel();
        }
        break;
      case 'growing':
        this.showGrowthInfo(plot);
        break;
      case 'ready':
        this.harvestFlower(plot);
        break;
      case 'withered':
        this.cleanPlot(plot);
        break;
    }
  }
  
  // 种植花卉
  plantFlower(plot, flowerType) {
    console.log(`在花田 ${plot.id} 种植 ${flowerType.name}`);
    
    // 检查是否有足够金币
    if (GameState.coins < flowerType.price) {
      this.showMessage(`金币不足！需要 ${flowerType.price} 金币`);
      return;
    }
    
    // 扣除金币
    GameState.coins -= flowerType.price;
    
    // 创建花卉数据
    const flowerData = {
      type: flowerType.id,
      growthStartTime: Date.now(),
      growthTime: flowerType.growthTime, // 秒
      progress: 0,
      state: 'growing'
    };
    
    // 更新游戏状态
    GameState.flowers[plot.id] = flowerData;
    plot.flower = flowerData;
    plot.state = 'growing';
    
    // 播放种植音效
    this.playSound('plant');
    
    // 保存游戏状态
    GameState.save();
    
    this.showMessage(`成功种植${flowerType.name}！`);
  }
  
  // 收获花卉
  harvestFlower(plot) {
    if (!plot.flower) return;
    
    const flowerType = CONFIG.FLOWER_TYPES.find(f => f.id === plot.flower.type);
    if (!flowerType) return;
    
    console.log(`收获花田 ${plot.id} 的 ${flowerType.name}`);
    
    // 获得奖励
    GameState.coins += flowerType.reward;
    GameState.exp += Math.floor(flowerType.reward / 2);
    
    // 检查升级
    if (GameState.exp >= GameState.expToNextLevel) {
      GameState.level++;
      GameState.exp -= GameState.expToNextLevel;
      GameState.expToNextLevel = Math.floor(GameState.expToNextLevel * 1.5);
      
      // 解锁新花田（每升一级解锁6个）
      if (GameState.level > 1 && GameState.unlockedPlots < CONFIG.PLOT_TOTAL) {
        GameState.unlockedPlots = Math.min(CONFIG.PLOT_TOTAL, GameState.level * 6);
        this.initPlots(); // 重新初始化花田
      }
      
      this.showMessage(`恭喜升级到 ${GameState.level} 级！解锁了新花田！`);
    }
    
    // 更新花卉状态为枯萎
    plot.flower.state = 'withered';
    plot.flower.lastHarvestTime = Date.now();
    plot.state = 'withered';
    
    // 播放收获音效
    this.playSound('harvest');
    
    // 保存游戏状态
    GameState.save();
    
    this.showMessage(`收获${flowerType.name}，获得${flowerType.reward}金币！`);
  }
  
  // 清理花田
  cleanPlot(plot) {
    console.log(`清理花田 ${plot.id}`);
    
    // 删除花卉数据
    delete GameState.flowers[plot.id];
    delete plot.flower;
    plot.state = 'empty';
    
    // 播放清理音效
    this.playSound('clean');
    
    // 保存游戏状态
    GameState.save();
    
    this.showMessage('花田已清理干净！');
  }
  
  // 一键收获
  harvestAll() {
    let harvestedCount = 0;
    let totalCoins = 0;
    
    this.plots.forEach(plot => {
      if (plot.isUnlocked && plot.state === 'ready' && plot.flower) {
        const flowerType = CONFIG.FLOWER_TYPES.find(f => f.id === plot.flower.type);
        if (flowerType) {
          totalCoins += flowerType.reward;
          GameState.exp += Math.floor(flowerType.reward / 2);
          
          plot.flower.state = 'withered';
          plot.flower.lastHarvestTime = Date.now();
          plot.state = 'withered';
          harvestedCount++;
        }
      }
    });
    
    if (harvestedCount > 0) {
      GameState.coins += totalCoins;
      this.playSound('harvest');
      this.showMessage(`一键收获 ${harvestedCount} 朵花，获得 ${totalCoins} 金币！`);
      GameState.save();
    } else {
      this.showMessage('没有可收获的花卉');
    }
  }
  
  // 一键清理
  cleanAll() {
    let cleanedCount = 0;
    
    this.plots.forEach(plot => {
      if (plot.isUnlocked && plot.state === 'withered') {
        delete GameState.flowers[plot.id];
        delete plot.flower;
        plot.state = 'empty';
        cleanedCount++;
      }
    });
    
    if (cleanedCount > 0) {
      this.playSound('clean');
      this.showMessage(`一键清理 ${cleanedCount} 块花田！`);
      GameState.save();
    } else {
      this.showMessage('没有可清理的花田');
    }
  }
  
  // 显示种子面板
  showSeedPanel() {
    console.log('显示种子面板');
    // 在实际实现中，这里会显示一个UI面板
    this.showMessage('种子面板（开发中）');
  }
  
  // 显示花卉图鉴
  showFlowerAlbum() {
    console.log('显示花卉图鉴');
    this.showMessage('花卉图鉴（开发中）');
  }
  
  // 显示装饰商店
  showDecorationShop() {
    console.log('显示装饰商店');
    this.showMessage('装饰商店（开发中）');
  }
  
  // 显示背包
  showBackpack() {
    console.log('显示背包');
    this.showMessage('背包（开发中）');
  }
  
  // 显示好友
  showFriends() {
    console.log('显示好友');
    this.showMessage('好友系统（开发中）');
  }
  
  // 显示设置
  showSettings() {
    console.log('显示设置');
    this.showMessage('游戏设置（开发中）');
  }
  
  // 显示解锁要求
  showUnlockRequirement(plot) {
    const requiredLevel = Math.ceil(plot.id / 6) + 1;
    this.showMessage(`需要等级 ${requiredLevel} 解锁`);
  }
  
  // 显示生长信息
  showGrowthInfo(plot) {
    if (!plot.flower) return;
    
    const flowerType = CONFIG.FLOWER_TYPES.find(f => f.id === plot.flower.type);
    if (!flowerType) return;
    
    const progress = plot.flower.progress || 0;
    const remainingTime = flowerType.growthTime * (1 - progress);
    const minutes = Math.ceil(remainingTime / 60);
    
    this.showMessage(`${flowerType.name} 正在生长，${minutes}分钟后开花`);
  }
  
  // 显示消息
  showMessage(text) {
    console.log('显示消息:', text);
    // 在实际实现中，这里会显示一个Toast消息
    // 暂时使用console.log
  }
  
  // 播放音效
  playSound(soundType) {
    console.log(`播放音效: ${soundType}`);
    // 音效实现依赖于平台API
    // 这里只做日志记录，实际实现需要平台特定的音频API
  }
}

// 工具函数
const Utils = {
  // 安全字符串操作
  safeString: function(str) {
    return (str || '') + '';
  },
  
  // 安全对象访问
  safeGet: function(obj, key, defaultValue) {
    return (obj || {})[key] || defaultValue;
  },
  
  // 安全数组操作
  safeArray: function(arr) {
    return arr || [];
  }
};

// ==========================================
// 游戏启动
// ==========================================

// 创建游戏实例
let gameInstance = null;

// 初始化游戏
function initGame() {
  if (gameInstance) {
    console.warn('游戏已初始化，跳过重复初始化');
    return;
  }
  
  gameInstance = new HealingGardenGame();
  gameInstance.init();
  
  // 绑定触摸事件
  bindTouchEvents();
  
  console.log('自动治愈花园 v2.0 启动完成！');
}

// 绑定触摸事件
function bindTouchEvents() {
  // 微信环境
  if (typeof wx !== 'undefined') {
    wx.onTouchStart(function(e) {
      if (gameInstance && e.touches && e.touches[0]) {
        const touch = e.touches[0];
        gameInstance.handleTouchStart(touch.clientX, touch.clientY);
      }
    });
    console.log('微信触摸事件绑定成功');
  }
  
  // 抖音环境
  if (typeof tt !== 'undefined') {
    tt.onTouchStart(function(e) {
      if (gameInstance && e.touches && e.touches[0]) {
        const touch = e.touches[0];
        gameInstance.handleTouchStart(touch.clientX, touch.clientY);
      }
    });
    console.log('抖音触摸事件绑定成功');
  }
}

// 页面加载完成后启动游戏
if (typeof wx !== 'undefined') {
  // 微信环境
  wx.onShow(function() {
    console.log('微信小游戏显示，启动游戏');
    initGame();
  });
} else if (typeof tt !== 'undefined') {
  // 抖音环境
  tt.onShow(function() {
    console.log('抖音小游戏显示，启动游戏');
    initGame();
  });
} else {
  // 非小游戏环境（测试用）
  console.log('非小游戏环境，直接启动游戏');
  setTimeout(initGame, 100);
}

// 导出游戏实例供调试
if (typeof globalThis !== 'undefined') {
  globalThis.HealingGarden = {
    game: gameInstance,
    GameState: GameState,
    CONFIG: CONFIG,
    Utils: Utils
  };
}

console.log('自动治愈花园 v2.0 代码加载完成');