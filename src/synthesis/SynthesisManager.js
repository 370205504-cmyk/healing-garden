/**
 * 合成管理器
 * 处理合成交互逻辑和特效
 */

// 依赖检查
if (typeof GameState === 'undefined') {
  console.error('SynthesisManager: GameState未定义，合成功能不可用');
}

const SynthesisManager = {
  // 状态
  isSynthesisMode: false,
  selectedPlant: null,
  selectedPlotIndex: -1,
  
  // 特效状态
  isPlayingEffect: false,
  currentEffect: null,
  
  // 配置
  config: {
    maxSynthesisDistance: 2, // 最大合成距离（网格单位）
    effectDuration: 500,      // 特效持续时间（毫秒）
    comboTimeout: 5000,       // 连击超时时间
    autoSave: true           // 是否自动保存
  },
  
  // 初始化
  init(gameInstance) {
    console.log('合成管理器初始化');
    this.game = gameInstance;
    this.bindEvents();
    
    // 初始化合成状态
    if (typeof SynthesisState !== 'undefined') {
      SynthesisState.init();
    } else {
      console.warn('SynthesisState未加载，合成状态功能受限');
    }
    
    return this;
  },
  
  // 绑定事件
  bindEvents() {
    // 事件将在游戏主循环中处理
    console.log('合成事件绑定完成（通过游戏主循环）');
  },
  
  // 进入/退出合成模式
  toggleSynthesisMode() {
    this.isSynthesisMode = !this.isSynthesisMode;
    this.selectedPlant = null;
    this.selectedPlotIndex = -1;
    
    console.log(`合成模式: ${this.isSynthesisMode ? '开启' : '关闭'}`);
    
    // 显示/隐藏合成提示
    this.showSynthesisHint(this.isSynthesisMode);
    
    return this.isSynthesisMode;
  },
  
  // 处理合成交互
  handleSynthesisInteraction(plotIndex, plantData) {
    if (!this.isSynthesisMode) {
      // 不在合成模式，尝试进入
      this.toggleSynthesisMode();
      this.selectPlant(plotIndex, plantData);
      return { action: 'select', plant: plantData };
    }
    
    if (this.selectedPlant === null) {
      // 选择第一个植物
      this.selectPlant(plotIndex, plantData);
      return { action: 'select', plant: plantData };
    } else {
      // 尝试合成
      return this.attemptSynthesis(plotIndex, plantData);
    }
  },
  
  // 选择植物
  selectPlant(plotIndex, plantData) {
    this.selectedPlant = plantData;
    this.selectedPlotIndex = plotIndex;
    
    console.log(`选择植物: ${plantData.type} (地块 ${plotIndex})`);
    
    // 显示选中效果
    this.showSelectionEffect(plotIndex);
    
    return this.selectedPlant;
  },
  
  // 尝试合成
  attemptSynthesis(targetPlotIndex, targetPlant) {
    // 检查是否可以合成
    if (!this.canSynthesize(this.selectedPlant, targetPlant, this.selectedPlotIndex, targetPlotIndex)) {
      console.log('合成失败：条件不满足');
      this.showSynthesisError();
      this.resetSelection();
      return { action: 'failed', reason: 'conditions' };
    }
    
    // 执行合成
    const result = this.performSynthesis(
      this.selectedPlotIndex, this.selectedPlant,
      targetPlotIndex, targetPlant
    );
    
    if (result.success) {
      // 显示合成成功效果
      this.showSynthesisSuccess(
        this.selectedPlotIndex, targetPlotIndex, 
        result.resultPlant
      );
      
      // 播放音效
      this.playSynthesisSound();
      
      // 更新游戏状态
      this.updateGameState(result);
      
      // 重置选择
      this.resetSelection();
      
      // 自动退出合成模式（可选）
      // this.toggleSynthesisMode();
      
      return { 
        action: 'success', 
        result: result,
        combo: SynthesisState ? SynthesisState.comboStreak : 0
      };
    } else {
      console.log('合成执行失败');
      this.showSynthesisError();
      this.resetSelection();
      return { action: 'failed', reason: 'execution' };
    }
  },
  
  // 检查是否可以合成
  canSynthesize(plantA, plantB, plotIndexA, plotIndexB) {
    // 基础检查
    if (!plantA || !plantB) return false;
    if (plotIndexA === plotIndexB) return false;
    
    // 类型检查
    if (plantA.type !== plantB.type) {
      console.log(`合成失败：类型不同 ${plantA.type} vs ${plantB.type}`);
      return false;
    }
    
    // 距离检查
    const distance = this.calculatePlotDistance(plotIndexA, plotIndexB);
    if (distance > this.config.maxSynthesisDistance) {
      console.log(`合成失败：距离太远 ${distance} > ${this.config.maxSynthesisDistance}`);
      return false;
    }
    
    // 状态检查（植物必须成熟）
    if (plantA.state !== 'ready' || plantB.state !== 'ready') {
      console.log('合成失败：植物未成熟');
      return false;
    }
    
    // 合成状态检查
    if (SynthesisState && !SynthesisState.canSynthesize(plantA, plantB)) {
      console.log('合成失败：状态不允许');
      return false;
    }
    
    return true;
  },
  
  // 计算地块距离
  calculatePlotDistance(plotIndexA, plotIndexB) {
    const COLS = 6; // 假设6列布局
    
    const rowA = Math.floor(plotIndexA / COLS);
    const colA = plotIndexA % COLS;
    const rowB = Math.floor(plotIndexB / COLS);
    const colB = plotIndexB % COLS;
    
    // 曼哈顿距离
    return Math.abs(rowA - rowB) + Math.abs(colA - colB);
  },
  
  // 执行合成
  performSynthesis(plotIndexA, plantA, plotIndexB, plantB) {
    try {
      // 获取合成结果
      let resultPlant;
      if (SynthesisState) {
        resultPlant = SynthesisState.getSynthesisResult(plantA, plantB);
      } else {
        // 简单回退逻辑
        resultPlant = this.getSimpleSynthesisResult(plantA, plantB);
      }
      
      if (!resultPlant) {
        return { success: false, error: '无合成结果' };
      }
      
      // 计算奖励
      const reward = SynthesisState 
        ? SynthesisState.calculateReward(plantA, plantB, resultPlant)
        : this.calculateSimpleReward(plantA, plantB);
      
      // 记录合成
      if (SynthesisState) {
        SynthesisState.recordCombo(
          [plantA, plantB], 
          resultPlant, 
          reward
        );
      }
      
      // 更新植物状态（在plotIndexA位置创建新植物）
      const updatedPlant = {
        ...resultPlant,
        plotIndex: plotIndexA,
        state: 'growing',
        growthStartTime: Date.now(),
        lastHarvestTime: null
      };
      
      // 删除被合成的植物（plotIndexB）
      const plantsToRemove = [plotIndexB];
      
      return {
        success: true,
        sourcePlants: [plantA, plantB],
        resultPlant: updatedPlant,
        reward: reward,
        updatedPlotIndex: plotIndexA,
        removedPlotIndices: plantsToRemove,
        comboStreak: SynthesisState ? SynthesisState.comboStreak : 0,
        comboMultiplier: SynthesisState ? SynthesisState.comboMultiplier : 1.0
      };
      
    } catch (error) {
      console.error('合成执行错误:', error);
      return { success: false, error: error.message };
    }
  },
  
  // 简单合成结果（回退逻辑）
  getSimpleSynthesisResult(plantA, plantB) {
    const baseType = plantA.type.replace(/_.*$/, '');
    const currentLevel = plantA.level || 1;
    const nextLevel = currentLevel + 1;
    
    return {
      type: `${baseType}_lvl${nextLevel}`,
      level: nextLevel,
      baseValue: (plantA.baseValue || 10) * 1.5,
      growthTime: (plantA.growthTime || 10) * 1.2,
      synthesisTime: Date.now()
    };
  },
  
  // 简单奖励计算
  calculateSimpleReward(plantA, plantB) {
    const baseValueA = plantA.baseValue || 10;
    const baseValueB = plantB.baseValue || 10;
    return Math.floor((baseValueA + baseValueB) * 0.75);
  },
  
  // 更新游戏状态
  updateGameState(synthesisResult) {
    if (!this.game || !synthesisResult.success) return;
    
    try {
      // 更新金币和经验
      if (GameState && synthesisResult.reward) {
        GameState.coins += synthesisResult.reward;
        GameState.exp += Math.floor(synthesisResult.reward / 2);
        
        // 检查升级
        if (GameState.exp >= GameState.expToNextLevel) {
          GameState.level++;
          GameState.exp -= GameState.expToNextLevel;
          GameState.expToNextLevel = Math.floor(GameState.expToNextLevel * 1.5);
          console.log(`升级到 Lv.${GameState.level}`);
        }
      }
      
      // 更新植物状态（需要在游戏主循环中实现）
      // this.updatePlantState(synthesisResult);
      
      // 自动保存
      if (this.config.autoSave) {
        setTimeout(() => {
          if (GameState && GameState.save) GameState.save();
          if (SynthesisState && SynthesisState.save) SynthesisState.save();
        }, 100);
      }
      
    } catch (error) {
      console.error('更新游戏状态失败:', error);
    }
  },
  
  // 显示选中效果
  showSelectionEffect(plotIndex) {
    // 在实际游戏中，这里会触发Canvas特效
    console.log(`显示选中效果: 地块 ${plotIndex}`);
    
    // 简单实现：修改地块样式
    if (this.game && this.game.highlightPlot) {
      this.game.highlightPlot(plotIndex, true);
    }
  },
  
  // 显示合成成功效果
  showSynthesisSuccess(sourcePlotIndex, targetPlotIndex, resultPlant) {
    console.log(`显示合成成功效果: ${sourcePlotIndex} + ${targetPlotIndex} -> ${resultPlant.type}`);
    
    // 在实际游戏中，这里会触发合成特效
    if (this.game && this.game.playSynthesisEffect) {
      this.game.playSynthesisEffect(sourcePlotIndex, targetPlotIndex, resultPlant);
    }
  },
  
  // 显示合成错误
  showSynthesisError() {
    console.log('显示合成错误效果');
    
    // 在实际游戏中，这里会显示错误提示
    if (this.game && this.game.showMessage) {
      this.game.showMessage('合成失败！请选择相邻的相同植物', 'error');
    }
  },
  
  // 显示合成提示
  showSynthesisHint(show) {
    if (show) {
      console.log('显示合成提示: 请选择第一个植物');
      
      if (this.game && this.game.showMessage) {
        this.game.showMessage('合成模式已开启！请选择第一个植物', 'info');
      }
    }
  },
  
  // 播放合成音效
  playSynthesisSound() {
    // 在实际游戏中，这里会播放音效
    console.log('播放合成音效');
    
    if (this.game && this.game.playSound) {
      this.game.playSound('synthesis');
    }
  },
  
  // 重置选择
  resetSelection() {
    // 清除选中效果
    if (this.selectedPlotIndex !== -1 && this.game && this.game.highlightPlot) {
      this.game.highlightPlot(this.selectedPlotIndex, false);
    }
    
    this.selectedPlant = null;
    this.selectedPlotIndex = -1;
  },
  
  // 获取合成状态信息
  getStatus() {
    return {
      isSynthesisMode: this.isSynthesisMode,
      selectedPlant: this.selectedPlant,
      selectedPlotIndex: this.selectedPlotIndex,
      comboStreak: SynthesisState ? SynthesisState.comboStreak : 0,
      comboMultiplier: SynthesisState ? SynthesisState.comboMultiplier : 1.0,
      unlockedCount: SynthesisState ? Object.keys(SynthesisState.unlockedSynthesis || {}).length : 0
    };
  },
  
  // 重置管理器
  reset() {
    this.isSynthesisMode = false;
    this.selectedPlant = null;
    this.selectedPlotIndex = -1;
    this.resetSelection();
    
    if (SynthesisState && SynthesisState.reset) {
      SynthesisState.reset();
    }
    
    console.log('合成管理器已重置');
  }
};

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SynthesisManager;
}

if (typeof globalThis !== 'undefined') {
  globalThis.SynthesisManager = SynthesisManager;
}