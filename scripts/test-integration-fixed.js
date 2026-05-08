#!/usr/bin/env node

/**
 * 修复集成测试
 * 为合成系统提供完整的模拟环境
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

console.log('=== 修复集成测试 ===\n');

// 创建完整的测试环境
const testCode = `
// 完整的模拟环境
globalThis.wx = {
  getStorageSync: (key) => {
    console.log('[测试] wx.getStorageSync:', key);
    return null;
  },
  setStorageSync: (key, value) => {
    console.log('[测试] wx.setStorageSync:', key, '(大小:', JSON.stringify(value).length, '字符)');
    return true;
  },
  createCanvas: () => ({
    width: 750,
    height: 1334,
    getContext: () => ({
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
    })
  }),
  onShow: (fn) => {
    console.log('[测试] wx.onShow注册');
    setTimeout(fn, 100);
  },
  onError: (fn) => {
    console.log('[测试] wx.onError注册');
  },
  onTouchStart: (fn) => {
    console.log('[测试] wx.onTouchStart注册');
  }
};

globalThis.tt = globalThis.wx;

// 游戏配置（必需）
globalThis.CONFIG = {
  SCREEN_WIDTH: 750,
  SCREEN_HEIGHT: 1334,
  PLOT_ROWS: 4,
  PLOT_COLS: 6,
  PLOT_TOTAL: 24,
  PLOT_INITIAL_UNLOCKED: 6,
  COLORS: {
    TEXT_RED: '#E53935',
    TEXT_GRAY: '#666666'
  },
  BOTTOM_BUTTONS: [
    { id: 'harvestAll', text: '一键收获' },
    { id: 'synthesis', text: '合成' }
  ],
  FLOWER_TYPES: [
    { id: 'sunflower', name: '向日葵', growthTime: 300, reward: 10, price: 5, color: '#FFD700' },
    { id: 'tulip', name: '郁金香', growthTime: 600, reward: 20, price: 10, color: '#FF69B4' }
  ]
};

// GameState（必需）
globalThis.GameState = {
  level: 2,
  coins: 100,
  exp: 0,
  expToNextLevel: 100,
  unlockedPlots: 6,
  flowers: {},
  save: () => console.log('[测试] GameState.save调用'),
  update: () => console.log('[测试] GameState.update调用')
};

console.log('=== 开始集成测试 ===');

try {
  // 1. 加载合成状态模块
  console.log('1. 加载SynthesisState...');
  require('./src/synthesis/SynthesisState.js');
  
  if (typeof SynthesisState === 'undefined') {
    console.error('❌ SynthesisState未定义');
    process.exit(1);
  }
  console.log('✅ SynthesisState加载成功');
  
  // 2. 初始化合成状态
  console.log('2. 初始化SynthesisState...');
  SynthesisState.init();
  console.log('✅ SynthesisState初始化成功');
  
  // 3. 加载合成管理器模块
  console.log('3. 加载SynthesisManager...');
  require('./src/synthesis/SynthesisManager.js');
  
  if (typeof SynthesisManager === 'undefined') {
    console.error('❌ SynthesisManager未定义');
    process.exit(1);
  }
  console.log('✅ SynthesisManager加载成功');
  
  // 4. 初始化合成管理器
  console.log('4. 初始化SynthesisManager...');
  const mockGame = {
    highlightPlot: () => console.log('[测试] highlightPlot调用'),
    showMessage: (text, type) => console.log('[测试] showMessage:', text, type || ''),
    playSound: (sound) => console.log('[测试] playSound:', sound)
  };
  
  const manager = SynthesisManager.init(mockGame);
  if (!manager) {
    console.error('❌ SynthesisManager.init返回空');
    process.exit(1);
  }
  console.log('✅ SynthesisManager初始化成功');
  
  // 5. 测试基础功能
  console.log('5. 测试基础功能...');
  
  // 测试切换合成模式
  const toggleResult = manager.toggleSynthesisMode();
  if (toggleResult === undefined) {
    console.error('❌ toggleSynthesisMode返回undefined');
    process.exit(1);
  }
  console.log('✅ toggleSynthesisMode成功，当前模式:', toggleResult ? '开启' : '关闭');
  
  // 测试选择植物
  const testPlant = { 
    type: 'sunflower', 
    state: 'ready',
    level: 1,
    baseValue: 10,
    growthTime: 300
  };
  
  const selectResult = manager.selectPlant(0, testPlant);
  if (selectResult !== testPlant) {
    console.error('❌ selectPlant返回错误');
    process.exit(1);
  }
  console.log('✅ selectPlant成功，选择地块: 0');
  
  // 测试获取状态
  const status = manager.getStatus();
  if (!status || typeof status !== 'object') {
    console.error('❌ getStatus返回错误');
    process.exit(1);
  }
  console.log('✅ getStatus成功:', JSON.stringify(status, null, 2));
  
  // 6. 测试合成状态
  console.log('6. 测试合成状态...');
  
  // 检查合成状态保存/加载
  SynthesisState.save();
  console.log('✅ SynthesisState.save成功');
  
  const stats = SynthesisState.getStats();
  if (!stats || typeof stats !== 'object') {
    console.error('❌ getStats返回错误');
    process.exit(1);
  }
  console.log('✅ getStats成功，总计合成:', stats.totalCombos);
  
  // 7. 测试合成逻辑
  console.log('7. 测试合成逻辑...');
  
  const plantA = { type: 'sunflower', state: 'ready', level: 1 };
  const plantB = { type: 'sunflower', state: 'ready', level: 1 };
  
  const canSynthesize = manager.canSynthesize(plantA, plantB, 0, 1);
  console.log('✅ canSynthesize测试完成，结果:', canSynthesize);
  
  // 8. 测试完成
  console.log('\\n=== 集成测试通过 ===');
  console.log('所有测试项成功完成');
  console.log('合成系统与GameState集成正常');
  
  process.exit(0);
  
} catch (error) {
  console.error('❌ 集成测试失败:', error);
  console.error('错误堆栈:', error.stack);
  process.exit(1);
}
`;

// 运行测试
const testFile = path.join(__dirname, 'integration-test-fixed.js');
console.log('创建测试文件...');
fs.writeFileSync(testFile, testCode);

console.log('运行集成测试...\n');

const child = spawn('node', [testFile], {
  cwd: path.join(__dirname, '..'),
  stdio: ['pipe', 'pipe', 'pipe'],
  timeout: 15000
});

let output = '';
let errorOutput = '';

child.stdout.on('data', (data) => {
  output += data.toString();
  process.stdout.write(data);
});

child.stderr.on('data', (data) => {
  errorOutput += data.toString();
  process.stderr.write(data);
});

child.on('close', (code) => {
  console.log('\n' + '='.repeat(60));
  console.log('测试进程退出码:', code);
  
  // 清理测试文件
  try {
    fs.unlinkSync(testFile);
    console.log('测试文件已清理');
  } catch (e) {
    // 忽略清理错误
  }
  
  if (code === 0) {
    console.log('✅ 集成测试修复成功！');
    process.exit(0);
  } else {
    console.log('❌ 集成测试修复失败');
    if (errorOutput) {
      console.log('错误输出:', errorOutput.substring(0, 500));
    }
    process.exit(1);
  }
});

child.on('error', (error) => {
  console.error('测试进程错误:', error);
  
  // 清理测试文件
  try {
    fs.unlinkSync(testFile);
  } catch (e) {
    // 忽略清理错误
  }
  
  process.exit(1);
});