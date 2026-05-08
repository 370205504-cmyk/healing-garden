/**
 * 合成系统主入口
 * 集成合成功能到现有游戏
 */

console.log('加载合成系统 v1.0...');

// 检查依赖
if (typeof GameState === 'undefined') {
  console.warn('GameState未定义，合成系统可能无法正常工作');
}

// 加载合成模块
try {
  // 合成状态管理
  require('./SynthesisState.js');
  console.log('合成状态模块加载成功');
} catch (e) {
  console.warn('合成状态模块加载失败:', e);
}

try {
  // 合成管理器
  require('./SynthesisManager.js');
  console.log('合成管理器模块加载成功');
} catch (e) {
  console.warn('合成管理器模块加载失败:', e);
}

// 合成系统集成器
const SynthesisIntegrator = {
  // 是否已集成
  isIntegrated: false,
  
  // 游戏实例引用
  gameInstance: null,
  
  // 合成管理器实例
  synthesisManager: null,
  
  // 集成到游戏
  integrate(game) {
    if (this.isIntegrated) {
      console.warn('合成系统已集成，跳过');
      return false;
    }
    
    if (!game) {
      console.error('无法集成：游戏实例无效');
      return false;
    }
    
    this.gameInstance = game;
    
    try {
      // 1. 初始化合成管理器
      if (typeof SynthesisManager !== 'undefined') {
        this.synthesisManager = SynthesisManager.init(game);
        console.log('合成管理器初始化成功');
      } else {
        console.error('SynthesisManager未定义，无法初始化');
        return false;
      }
      
      // 2. 扩展游戏方法
      this.extendGameMethods();
      
      // 3. 添加合成UI元素
      this.addSynthesisUI();
      
      // 4. 修改游戏主循环
      this.modifyGameLoop();
      
      this.isIntegrated = true;
      console.log('合成系统集成成功！');
      return true;
      
    } catch (error) {
      console.error('合成系统集成失败:', error);
      return false;
    }
  },
  
  // 扩展游戏方法
  extendGameMethods() {
    if (!this.gameInstance) return;
    
    // 添加合成模式切换方法
    this.gameInstance.toggleSynthesisMode = () => {
      if (this.synthesisManager) {
        return this.synthesisManager.toggleSynthesisMode();
      }
      return false;
    };
    
    // 添加合成交互处理方法
    this.gameInstance.handleSynthesis = (plotIndex, plantData) => {
      if (this.synthesisManager) {
        return this.synthesisManager.handleSynthesisInteraction(plotIndex, plantData);
      }
      return null;
    };
    
    // 添加合成状态获取方法
    this.gameInstance.getSynthesisStatus = () => {
      if (this.synthesisManager) {
        return this.synthesisManager.getStatus();
      }
      return null;
    };
    
    console.log('游戏方法扩展完成');
  },
  
  // 添加合成UI元素
  addSynthesisUI() {
    // 在实际游戏中，这里会添加合成按钮和状态显示
    console.log('合成UI元素已准备（需要Canvas渲染实现）');
    
    // 可以在这里添加合成按钮到游戏界面
    this.addSynthesisButton();
  },
  
  // 添加合成按钮
  addSynthesisButton() {
    // 简单实现：在控制台显示按钮状态
    console.log('合成按钮：按"S"键切换合成模式');
    
    // 在实际Canvas游戏中，需要添加绘制代码
    if (this.gameInstance && this.gameInstance.addButton) {
      // 假设游戏有addButton方法
      const synthesisButton = {
        id: 'synthesis',
        icon: '✨',
        text: '合成',
        x: 600,
        y: 50,
        width: 80,
        height: 40,
        onClick: () => {
          if (this.synthesisManager) {
            const isMode = this.synthesisManager.toggleSynthesisMode();
            console.log(`合成模式${isMode ? '开启' : '关闭'}`);
          }
        }
      };
      
      // this.gameInstance.addButton(synthesisButton);
    }
  },
  
  // 修改游戏主循环
  modifyGameLoop() {
    // 在实际游戏中，这里会修改渲染和更新逻辑
    console.log('游戏主循环已标记需要合成支持');
    
    // 建议在游戏更新循环中添加合成状态检查
    if (this.gameInstance && typeof this.gameInstance.update === 'function') {
      const originalUpdate = this.gameInstance.update.bind(this.gameInstance);
      
      this.gameInstance.update = function(deltaTime) {
        // 调用原始更新
        originalUpdate(deltaTime);
        
        // 合成系统更新
        // 可以在这里添加合成特效更新等
      };
      
      console.log('游戏更新循环已扩展');
    }
  },
  
  // 处理触摸事件（合成模式）
  handleTouchForSynthesis(x, y) {
    if (!this.synthesisManager || !this.synthesisManager.isSynthesisMode) {
      return false; // 不在合成模式，交给原有逻辑
    }
    
    // 在实际游戏中，这里会检查触摸位置是否在植物上
    // 然后调用合成管理器处理
    
    console.log(`合成模式触摸: (${x}, ${y})`);
    
    // 示例：如果游戏有getPlotAtPosition方法
    if (this.gameInstance && this.gameInstance.getPlotAtPosition) {
      const plotInfo = this.gameInstance.getPlotAtPosition(x, y);
      if (plotInfo) {
        const result = this.synthesisManager.handleSynthesisInteraction(
          plotInfo.index, 
          plotInfo.plant
        );
        return result !== null;
      }
    }
    
    return false;
  },
  
  // 获取合成统计
  getStats() {
    if (typeof SynthesisState !== 'undefined') {
      return SynthesisState.getStats();
    }
    return null;
  },
  
  // 重置合成系统
  reset() {
    if (this.synthesisManager) {
      this.synthesisManager.reset();
    }
    
    if (typeof SynthesisState !== 'undefined' && SynthesisState.reset) {
      SynthesisState.reset();
    }
    
    this.isIntegrated = false;
    console.log('合成系统已重置');
  },
  
  // 测试合成功能
  testSynthesis() {
    console.log('=== 合成系统测试 ===');
    
    // 创建测试植物数据
    const testPlantA = {
      type: 'sunflower',
      level: 1,
      baseValue: 10,
      growthTime: 5,
      state: 'ready'
    };
    
    const testPlantB = {
      type: 'sunflower',
      level: 1,
      baseValue: 10,
      growthTime: 5,
      state: 'ready'
    };
    
    // 测试合成检查
    if (this.synthesisManager) {
      const canSynthesize = this.synthesisManager.canSynthesize(
        testPlantA, testPlantB, 0, 1
      );
      
      console.log(`合成检查: ${canSynthesize ? '通过' : '失败'}`);
      
      if (canSynthesize) {
        // 模拟合成
        const result = this.synthesisManager.performSynthesis(
          0, testPlantA, 1, testPlantB
        );
        
        console.log('合成结果:', result.success ? '成功' : '失败');
        if (result.success) {
          console.log('奖励:', result.reward);
          console.log('新植物:', result.resultPlant.type);
        }
      }
    }
    
    console.log('=== 测试结束 ===');
  }
};

// 自动集成到全局游戏对象
if (typeof globalThis !== 'undefined' && globalThis.HealingGarden) {
  setTimeout(() => {
    console.log('尝试自动集成合成系统到游戏...');
    
    if (globalThis.HealingGarden.game) {
      const success = SynthesisIntegrator.integrate(globalThis.HealingGarden.game);
      if (success) {
        globalThis.HealingGarden.Synthesis = SynthesisIntegrator;
        console.log('合成系统自动集成成功！');
      } else {
        console.warn('合成系统自动集成失败，需要手动集成');
      }
    }
  }, 1000);
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SynthesisIntegrator;
}

if (typeof globalThis !== 'undefined') {
  globalThis.SynthesisIntegrator = SynthesisIntegrator;
  
  // 提供全局访问
  globalThis.SynthesisSystem = {
    integrator: SynthesisIntegrator,
    state: typeof SynthesisState !== 'undefined' ? SynthesisState : null,
    manager: typeof SynthesisManager !== 'undefined' ? SynthesisManager : null,
    
    // 便捷方法
    toggleMode: () => {
      if (SynthesisIntegrator.synthesisManager) {
        return SynthesisIntegrator.synthesisManager.toggleSynthesisMode();
      }
      return false;
    },
    
    getStatus: () => {
      if (SynthesisIntegrator.synthesisManager) {
        return SynthesisIntegrator.synthesisManager.getStatus();
      }
      return null;
    },
    
    test: () => {
      SynthesisIntegrator.testSynthesis();
    },
    
    reset: () => {
      SynthesisIntegrator.reset();
    }
  };
}

console.log('合成系统主入口加载完成');