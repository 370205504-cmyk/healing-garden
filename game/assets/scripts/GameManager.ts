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
    private _plantingSystem: PlantingSystem | null = null;
    private _gardenSystem: GardenSystem | null = null;
    private _economySystem: EconomySystem | null = null;
    private _uiManager: UIManager | null = null;

    onLoad() {
        if (GameManager._instance && GameManager._instance !== this) {
            this.destroy();
            return;
        }
        GameManager._instance = this;
        this.loadGameData();
    }

    initializeGame() {
        console.log('[GameManager] 初始化游戏系统');
        this.node.emit('coins-updated', this._coins);
        this.node.emit('level-up', this._level);
    }

    // ============ 金币 ============

    get coins(): number { return this._coins; }

    addCoins(amount: number) {
        this._coins += amount;
        this.saveGameData();
        this.node.emit('coins-updated', this._coins);
    }

    spendCoins(amount: number): boolean {
        if (this._coins >= amount) {
            this._coins -= amount;
            this.saveGameData();
            this.node.emit('coins-updated', this._coins);
            return true;
        }
        return false;
    }

    // ============ 等级/经验 ============

    get level(): number { return this._level; }
    get experience(): number { return this._experience; }
    get requiredExperience(): number { return this._level * 100; }

    addExperience(exp: number) {
        this._experience += exp;
        let expRequired = this._level * 100;
        while (this._experience >= expRequired) {
            this._experience -= expRequired;
            this._level++;
            expRequired = this._level * 100;
            this.node.emit('level-up', this._level);
            console.log(`[GameManager] 升级 Lv.${this._level}`);
        }
        this.saveGameData();
    }

    /** 当前等级可解锁的地块数（前6格初始解锁，之后每级+6，最多24） */
    getUnlockedPlotCount(): number {
        return Math.min(24, 6 + (this._level - 1) * 6);
    }

    // ============ 永久 ============

    saveGameData() {
        StorageUtil.set('auto_healing_garden', {
            coins: this._coins,
            level: this._level,
            experience: this._experience,
        });
    }

    loadGameData() {
        const data = StorageUtil.get<{
            coins?: number; level?: number; experience?: number;
        }>('auto_healing_garden');
        if (data) {
            this._coins = data.coins ?? 100;
            this._level = data.level ?? 1;
            this._experience = data.experience ?? 0;
        }
    }

    resetGame() {
        this._coins = 100;
        this._level = 1;
        this._experience = 0;
        this.saveGameData();
        this.node.emit('game-reset');
    }

    // ============ DI ============

    setPlantingSystem(ps: PlantingSystem | null) { this._plantingSystem = ps; }
    setGardenSystem(gs: GardenSystem | null) { this._gardenSystem = gs; }
    setEconomySystem(eco: EconomySystem | null) { this._economySystem = eco; }
    setUIManager(ui: UIManager | null) { this._uiManager = ui; }

    get plantingSystem(): PlantingSystem | null { return this._plantingSystem; }
    get gardenSystem(): GardenSystem | null { return this._gardenSystem; }
    get economySystem(): EconomySystem | null { return this._economySystem; }
    get uiManager(): UIManager | null { return this._uiManager; }

    update(_deltaTime: number) {}
}
