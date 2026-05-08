import { _decorator, Component, Node } from 'cc';
import { PlantingSystem } from './PlantingSystem';
import { GardenSystem } from './GardenSystem';
import { EconomySystem } from './EconomySystem';
import { UIManager } from './UIManager';
import { StorageUtil } from './utils/StorageUtil';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
    
    private static _instance: GameManager;
    
    public static get instance(): GameManager {
        return GameManager._instance;
    }
    
    // 游戏状态
    private _coins: number = 100;
    private _level: number = 1;
    private _experience: number = 0;
    
    // 系统引用
    private _plantingSystem: PlantingSystem = null!;
    private _gardenSystem: GardenSystem = null!;
    private _economySystem: EconomySystem = null!;
    private _uiManager: UIManager = null!;
    
    onLoad() {
        if (GameManager._instance && GameManager._instance !== this) {
            this.destroy();
            return;
        }
        GameManager._instance = this;
        
        // 初始化游戏
        this.initGame();
    }
    
    initGame() {
        console.log('游戏初始化');
        // 加载保存数据
        this.loadGameData();
    }
    
    // 获取金币
    get coins(): number {
        return this._coins;
    }
    
    // 增加金币
    addCoins(amount: number) {
        this._coins += amount;
        this.saveGameData();
        // 触发金币更新事件
        this.node.emit('coins-updated', this._coins);
    }
    
    // 消耗金币
    spendCoins(amount: number): boolean {
        if (this._coins >= amount) {
            this._coins -= amount;
            this.saveGameData();
            this.node.emit('coins-updated', this._coins);
            return true;
        }
        return false;
    }
    
    // 增加经验
    addExperience(exp: number) {
        this._experience += exp;
        // 升级逻辑
        const expRequired = this._level * 100;
        if (this._experience >= expRequired) {
            this._level++;
            this._experience = 0;
            this.node.emit('level-up', this._level);
        }
        this.saveGameData();
    }
    
    // 获取等级
    get level(): number {
        return this._level;
    }
    
    // 获取经验
    get experience(): number {
        return this._experience;
    }
    
    // 获取所需经验
    get requiredExperience(): number {
        return this._level * 100;
    }
    
    // 保存游戏数据
    saveGameData() {
        StorageUtil.set('auto_healing_garden', {
            coins: this._coins,
            level: this._level,
            experience: this._experience
        });
    }
    
    // 加载游戏数据
    loadGameData() {
        const data = StorageUtil.get<{
            coins?: number;
            level?: number;
            experience?: number;
        }>('auto_healing_garden');
        if (data) {
            this._coins = data.coins ?? 100;
            this._level = data.level ?? 1;
            this._experience = data.experience ?? 0;
        }
    }
    
    // 重置游戏
    resetGame() {
        this._coins = 100;
        this._level = 1;
        this._experience = 0;
        this.saveGameData();
        this.node.emit('game-reset');
    }
    
    // 系统引用设置
    setPlantingSystem(system: PlantingSystem) {
        this._plantingSystem = system;
    }
    
    setGardenSystem(system: GardenSystem) {
        this._gardenSystem = system;
    }
    
    setEconomySystem(system: EconomySystem) {
        this._economySystem = system;
    }
    
    setUIManager(manager: UIManager) {
        this._uiManager = manager;
    }
    
    // 获取系统引用
    get plantingSystem(): PlantingSystem {
        return this._plantingSystem;
    }
    
    get gardenSystem(): GardenSystem {
        return this._gardenSystem;
    }
    
    get economySystem(): EconomySystem {
        return this._economySystem;
    }
    
    get uiManager(): UIManager {
        return this._uiManager;
    }
    
    // 初始化游戏（主场景调用）
    initializeGame() {
        console.log('GameManager: 初始化游戏系统');
        // 触发UI更新
        this.node.emit('coins-updated', this._coins);
        this.node.emit('level-up', this._level);
    }
    
    // 游戏主循环更新
    update(deltaTime: number) {
        // 游戏逻辑更新可以放在这里
        // 例如：定时保存、全局状态检查等
    }
}
