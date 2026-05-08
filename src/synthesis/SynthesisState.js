/**
 * 合成系统状态管理
 * 扩展原有GameState，支持合成相关状态
 */

// 合成等级定义
const SYNTHESIS_LEVELS = {
  1: { name: '幼苗', emoji: '🌱', baseValue: 10, color: '#81C784' },
  2: { name: '小树', emoji: '🌿', baseValue: 25, color: '#4CAF50' },
  3: { name: '大树', emoji: '🌳', baseValue: 50, color: '#388E3C' },
  4: { name: '竹子', emoji: '🎋', baseValue: 100, color: '#689F38' },
  5: { name: '椰树', emoji: '🌴', baseValue: 200, color: '#F57C00' },
  6: { name: '松树', emoji: '🌲', baseValue: 400, color: '#5D4037' }
};

// 合成规则配置
const SYNTHESIS_RULES = {
  // 基础植物合成
  'sunflower': { nextLevel: 'sunflower_lvl2', required: 2, time: 5 },
  'tulip': { nextLevel: 'tulip_lvl2', required: 2, time: 8 },
  'rose': { nextLevel: 'rose_lvl2', required: 2, time: 10 },
  'daisy': { nextLevel: 'daisy_lvl2', required: 2, time: 12 },
  'lavender': { nextLevel: 'lavender_lvl2', required: 2, time: 15 },
  
  // 二级合成
  'sunflower_lvl2': { nextLevel: 'sunflower_lvl3', required: 2, time: 15 },
  'tulip_lvl2': { nextLevel: 'tulip_lvl3', required: 2, time: 20 },
  
  // 特殊合成
  'mixed_bouquet': { 
    nextLevel: 'rainbow_flower', 
    required: ['sunflower_lvl2', 'tulip_lvl2', 'rose_lvl2'],
    time: 30,
    special: true
  }
};

// 合成状态管理器
const SynthesisState = {
  // 合成记录
  combos: [],
  
  // 连击状态
  comboStreak: 0,
  comboMultiplier: 1.0,
  lastComboTime: 0,
  
  // 合成解锁状态
  unlockedSynthesis: {
    'sunflower': true,    // 基础合成默认解锁
    'tulip': true,
    'rose': true
  },
  
  // 合成统计数据
  stats: {
    totalCombos: 0,
    totalReward: 0,
    highestCombo: 0,
    favoritePlant: ''
  },
  
  // 初始化方法
  init() {
    console.log('合成状态管理器初始化');
    this.load();
  },
  
  // 加载合成状态
  load() {
    try {
      if (typeof wx !== 'undefined' && wx.getStorageSync) {
        const saved = wx.getStorageSync('healing_garden_synthesis');
        if (saved) {
          this.combos = saved.combos || [];
          this.comboStreak = saved.comboStreak || 0;
          this.comboMultiplier = saved.comboMultiplier || 1.0;
          this.lastComboTime = saved.lastComboTime || 0;
          this.unlockedSynthesis = saved.unlockedSynthesis || this.unlockedSynthesis;
          this.stats = saved.stats || this.stats;
          console.log('合成状态加载成功');
        }
      }
    } catch (e) {
      console.warn('合成状态加载失败:', e);
    }
  },
  
  // 保存合成状态
  save() {
    try {
      if (typeof wx !== 'undefined' && wx.setStorageSync) {
        const saveData = {
          combos: this.combos,
          comboStreak: this.comboStreak,
          comboMultiplier: this.comboMultiplier,
          lastComboTime: this.lastComboTime,
          unlockedSynthesis: this.unlockedSynthesis,
          stats: this.stats
        };
        wx.setStorageSync('healing_garden_synthesis', saveData);
        console.log('合成状态保存成功');
      }
    } catch (e) {
      console.warn('合成状态保存失败:', e);
    }
  },
  
  // 记录合成
  recordCombo(sourcePlants, resultPlant, reward) {
    const now = Date.now();
    const comboRecord = {
      id: `combo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sources: sourcePlants,
      result: resultPlant,
      reward: reward,
      timestamp: now,
      streak: this.comboStreak,
      multiplier: this.comboMultiplier
    };
    
    // 添加到记录
    this.combos.push(comboRecord);
    
    // 更新连击状态
    this.updateComboStatus(now);
    
    // 更新统计数据
    this.updateStats(comboRecord);
    
    // 保存状态
    this.save();
    
    return comboRecord;
  },
  
  // 更新连击状态
  updateComboStatus(currentTime) {
    const COMBO_TIMEOUT = 5000; // 5秒内连续合成算连击
    
    if (this.lastComboTime === 0) {
      // 第一次合成
      this.comboStreak = 1;
      this.comboMultiplier = 1.0;
    } else if (currentTime - this.lastComboTime < COMBO_TIMEOUT) {
      // 连击成功
      this.comboStreak++;
      this.comboMultiplier = Math.min(3.0, 1.0 + this.comboStreak * 0.2);
      
      // 更新最高连击记录
      if (this.comboStreak > this.stats.highestCombo) {
        this.stats.highestCombo = this.comboStreak;
      }
    } else {
      // 连击中断
      this.comboStreak = 1;
      this.comboMultiplier = 1.0;
    }
    
    this.lastComboTime = currentTime;
  },
  
  // 更新统计数据
  updateStats(comboRecord) {
    this.stats.totalCombos++;
    this.stats.totalReward += comboRecord.reward;
    
    // 更新最受欢迎植物
    if (comboRecord.result && comboRecord.result.type) {
      // 简化统计：暂时记录最后一次合成
      this.stats.favoritePlant = comboRecord.result.type;
    }
  },
  
  // 检查是否可以合成
  canSynthesize(plantA, plantB) {
    // 基础检查
    if (!plantA || !plantB) return false;
    if (plantA.type !== plantB.type) return false;
    
    // 检查合成规则
    const rule = SYNTHESIS_RULES[plantA.type];
    if (!rule) return false;
    
    // 检查是否解锁
    if (!this.unlockedSynthesis[plantA.type]) return false;
    
    return true;
  },
  
  // 获取合成结果
  getSynthesisResult(plantA, plantB) {
    if (!this.canSynthesize(plantA, plantB)) return null;
    
    const rule = SYNTHESIS_RULES[plantA.type];
    if (!rule) return null;
    
    return {
      type: rule.nextLevel,
      level: (plantA.level || 1) + 1,
      baseValue: this.calculateBaseValue(rule.nextLevel),
      growthTime: rule.time,
      synthesisTime: Date.now()
    };
  },
  
  // 计算基础价值
  calculateBaseValue(plantType) {
    // 根据植物类型和等级计算价值
    const levelMatch = plantType.match(/lvl(\d+)/);
    const baseType = plantType.replace(/_.*$/, '');
    const level = levelMatch ? parseInt(levelMatch[1]) : 1;
    
    // 基础价值 * 等级系数
    const baseValue = SYNTHESIS_LEVELS[level]?.baseValue || 10;
    const levelMultiplier = Math.pow(1.5, level - 1);
    
    return Math.floor(baseValue * levelMultiplier);
  },
  
  // 计算合成奖励
  calculateReward(plantA, plantB, resultPlant) {
    if (!resultPlant) return 0;
    
    const baseReward = resultPlant.baseValue || 10;
    const comboBonus = baseReward * (this.comboMultiplier - 1);
    const totalReward = Math.floor(baseReward + comboBonus);
    
    return totalReward;
  },
  
  // 解锁合成类型
  unlockSynthesis(plantType) {
    if (!this.unlockedSynthesis[plantType]) {
      this.unlockedSynthesis[plantType] = true;
      this.save();
      console.log(`合成类型解锁: ${plantType}`);
      return true;
    }
    return false;
  },
  
  // 获取合成统计信息
  getStats() {
    return {
      ...this.stats,
      currentStreak: this.comboStreak,
      currentMultiplier: this.comboMultiplier,
      unlockedCount: Object.keys(this.unlockedSynthesis).filter(k => this.unlockedSynthesis[k]).length
    };
  },
  
  // 重置合成状态（测试用）
  reset() {
    this.combos = [];
    this.comboStreak = 0;
    this.comboMultiplier = 1.0;
    this.lastComboTime = 0;
    this.stats = {
      totalCombos: 0,
      totalReward: 0,
      highestCombo: 0,
      favoritePlant: ''
    };
    this.save();
    console.log('合成状态已重置');
  }
};

// 初始化合成状态
SynthesisState.init();

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SynthesisState;
}

if (typeof globalThis !== 'undefined') {
  globalThis.SynthesisState = SynthesisState;
}