import { GameManager } from '../game/assets/scripts/GameManager';

describe('GameManager', () => {
  let gameManager: GameManager;

  beforeEach(() => {
    // 创建GameManager实例
    gameManager = new GameManager();
    // 模拟node属性
    gameManager.node = new cc.Node();
  });

  test('初始金币应为100', () => {
    expect(gameManager.coins).toBe(100);
  });

  test('初始等级应为1', () => {
    expect(gameManager.level).toBe(1);
  });

  test('初始经验应为0', () => {
    expect(gameManager.experience).toBe(0);
  });

  test('增加金币', () => {
    const initialCoins = gameManager.coins;
    gameManager.addCoins(50);
    expect(gameManager.coins).toBe(initialCoins + 50);
  });

  test('消耗金币成功', () => {
    gameManager.addCoins(100);
    const result = gameManager.spendCoins(50);
    expect(result).toBe(true);
    expect(gameManager.coins).toBe(150); // 100初始 + 100增加 - 50消费 = 150
  });

  test('消耗金币失败（金币不足）', () => {
    const initialCoins = gameManager.coins;
    const result = gameManager.spendCoins(200);
    expect(result).toBe(false);
    expect(gameManager.coins).toBe(initialCoins);
  });

  test('增加经验', () => {
    const initialExp = gameManager.experience;
    gameManager.addExperience(50);
    expect(gameManager.experience).toBe(initialExp + 50);
  });

  test('等级提升', () => {
    // 升级需要100经验（等级1 * 100）
    gameManager.addExperience(100);
    expect(gameManager.level).toBe(2);
    expect(gameManager.experience).toBe(0); // 经验重置
  });

  test('保存游戏数据', () => {
    gameManager.addCoins(50);
    gameManager.addExperience(30);
    gameManager.saveGameData();

    const saved = localStorage.getItem('auto_healing_garden');
    expect(saved).not.toBeNull();
    
    if (saved) {
      const data = JSON.parse(saved);
      expect(data.coins).toBe(150); // 100 + 50
      expect(data.experience).toBe(30);
    }
  });

  test('加载游戏数据', () => {
    const testData = {
      coins: 500,
      level: 3,
      experience: 75
    };
    localStorage.setItem('auto_healing_garden', JSON.stringify(testData));
    
    // 重新创建GameManager实例以触发加载
    const newManager = new GameManager();
    newManager.node = new cc.Node();
    newManager.loadGameData();
    
    expect(newManager.coins).toBe(testData.coins);
    expect(newManager.level).toBe(testData.level);
    expect(newManager.experience).toBe(testData.experience);
  });

  test('重置游戏', () => {
    gameManager.addCoins(200);
    gameManager.addExperience(150);
    gameManager.resetGame();

    expect(gameManager.coins).toBe(100);
    expect(gameManager.level).toBe(1);
    expect(gameManager.experience).toBe(0);
  });

  test('所需经验计算', () => {
    // 等级1需要100经验
    expect(gameManager.requiredExperience).toBe(100);
    
    // 模拟升级到等级2
    gameManager.addExperience(100);
    expect(gameManager.requiredExperience).toBe(200); // 等级2 * 100
  });

  test('系统引用设置', () => {
    const mockSystem = {};
    gameManager.setPlantingSystem(mockSystem as any);
    gameManager.setGardenSystem(mockSystem as any);
    gameManager.setEconomySystem(mockSystem as any);
    gameManager.setUIManager(mockSystem as any);

    expect(gameManager.plantingSystem).toBe(mockSystem);
    expect(gameManager.gardenSystem).toBe(mockSystem);
    expect(gameManager.economySystem).toBe(mockSystem);
    expect(gameManager.uiManager).toBe(mockSystem);
  });
});