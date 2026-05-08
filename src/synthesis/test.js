/**
 * 合成系统测试
 * 验证基础功能
 */

console.log('=== 合成系统单元测试 ===');

// 模拟环境
if (typeof wx === 'undefined') {
  globalThis.wx = {
    getStorageSync: (key) => {
      console.log(`模拟 wx.getStorageSync: ${key}`);
      return null;
    },
    setStorageSync: (key, value) => {
      console.log(`模拟 wx.setStorageSync: ${key}`);
      return true;
    }
  };
}

if (typeof GameState === 'undefined') {
  globalThis.GameState = {
    level: 1,
    coins: 100,
    exp: 0,
    expToNextLevel: 100,
    unlockedPlots: 6,
    flowers: {},
    save: () => console.log('模拟 GameState.save'),
    update: () => console.log('模拟 GameState.update')
  };
}

// 测试结果统计
const testResults = {
  total: 0,
  passed: 0,
  failed: 0
};

// 测试工具
function test(name, testFn) {
  testResults.total++;
  try {
    const result = testFn();
    if (result) {
      console.log(`✅ ${name} - 通过`);
      testResults.passed++;
    } else {
      console.log(`❌ ${name} - 失败`);
      testResults.failed++;
    }
  } catch (error) {
    console.log(`❌ ${name} - 错误: ${error.message}`);
    testResults.failed++;
  }
}

// 运行测试
async function runTests() {
  console.log('\n--- 开始合成系统测试 ---\n');
  
  // 测试1: 模块加载
  test('合成状态模块加载', () => {
    try {
      require('./SynthesisState.js');
      return typeof SynthesisState !== 'undefined';
    } catch (e) {
      console.log(`加载错误: ${e.message}`);
      return false;
    }
  });
  
  test('合成管理器模块加载', () => {
    try {
      require('./SynthesisManager.js');
      return typeof SynthesisManager !== 'undefined';
    } catch (e) {
      console.log(`加载错误: ${e.message}`);
      return false;
    }
  });
  
  // 等待模块加载
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // 测试2: 合成状态基础功能
  if (typeof SynthesisState !== 'undefined') {
    test('合成状态初始化', () => {
      SynthesisState.init();
      return SynthesisState.combos !== undefined;
    });
    
    test('合成状态保存/加载', () => {
      const initialCombos = SynthesisState.combos.length;
      SynthesisState.recordCombo([], {}, 10);
      const afterCombos = SynthesisState.combos.length;
      return afterCombos === initialCombos + 1;
    });
    
    test('合成状态解锁功能', () => {
      const initial = SynthesisState.unlockedSynthesis['sunflower'];
      SynthesisState.unlockSynthesis('sunflower');
      return SynthesisState.unlockedSynthesis['sunflower'] === true;
    });
  }
  
  // 测试3: 合成管理器基础功能
  if (typeof SynthesisManager !== 'undefined') {
    const mockGame = {
      highlightPlot: () => {},
      showMessage: () => {},
      playSound: () => {}
    };
    
    const manager = SynthesisManager.init(mockGame);
    
    test('合成管理器初始化', () => {
      return manager && manager.game === mockGame;
    });
    
    test('合成模式切换', () => {
      const initial = manager.isSynthesisMode;
      manager.toggleSynthesisMode();
      const after = manager.isSynthesisMode;
      return initial !== after;
    });
    
    test('植物选择', () => {
      const testPlant = { type: 'sunflower', state: 'ready' };
      const selected = manager.selectPlant(0, testPlant);
      return selected === testPlant && manager.selectedPlotIndex === 0;
    });
  }
  
  // 测试4: 合成逻辑
  test('合成条件检查', () => {
    const plantA = { type: 'sunflower', state: 'ready', level: 1 };
    const plantB = { type: 'sunflower', state: 'ready', level: 1 };
    const plantC = { type: 'tulip', state: 'ready', level: 1 };
    const plantD = { type: 'sunflower', state: 'growing', level: 1 };
    
    // 需要SynthesisManager实例
    if (typeof SynthesisManager !== 'undefined') {
      const manager = SynthesisManager.init({});
      
      // 相同类型应该可以合成
      const sameType = manager.canSynthesize(plantA, plantB, 0, 1);
      
      // 不同类型不应该合成
      const diffType = manager.canSynthesize(plantA, plantC, 0, 1);
      
      // 未成熟不应该合成
      const notReady = manager.canSynthesize(plantA, plantD, 0, 1);
      
      return sameType && !diffType && !notReady;
    }
    return false;
  });
  
  // 测试5: 距离计算
  test('地块距离计算', () => {
    if (typeof SynthesisManager !== 'undefined') {
      const manager = SynthesisManager.init({});
      
      // 相邻地块（假设6列布局）
      const distance1 = manager.calculatePlotDistance(0, 1); // 同一行相邻
      const distance2 = manager.calculatePlotDistance(0, 6); // 下一行同一列
      const distance3 = manager.calculatePlotDistance(0, 7); // 下一行下一列
      
      return distance1 === 1 && distance2 === 1 && distance3 === 2;
    }
    return false;
  });
  
  console.log('\n--- 测试结果 ---');
  console.log(`总计: ${testResults.total}`);
  console.log(`通过: ${testResults.passed}`);
  console.log(`失败: ${testResults.failed}`);
  console.log(`通过率: ${(testResults.passed / testResults.total * 100).toFixed(1)}%`);
  
  if (testResults.failed === 0) {
    console.log('\n🎉 所有测试通过！');
    return true;
  } else {
    console.log('\n⚠️  有测试失败，请检查');
    return false;
  }
}

// 执行测试
if (require.main === module) {
  runTests().then(success => {
    process.exit(success ? 0 : 1);
  });
}

// 导出测试函数
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runTests };
}

console.log('=== 合成系统测试加载完成 ===');