import { _decorator, Component, Node, director } from 'cc';
import { GameManager } from './GameManager';
import { PlantingSystem } from './PlantingSystem';
import { GardenSystem } from './GardenSystem';
import { EconomySystem } from './EconomySystem';
import { UIManager } from './UIManager';

const { ccclass, property } = _decorator;

@ccclass('MainScene')
export class MainScene extends Component {
    @property(Node)
    gameManagerNode: Node = null!;

    @property(Node)
    plantingSystemNode: Node = null!;

    @property(Node)
    gardenSystemNode: Node = null!;

    @property(Node)
    economySystemNode: Node = null!;

    @property(Node)
    uiManagerNode: Node = null!;

    private gameManager: GameManager = null!;
    private plantingSystem: PlantingSystem = null!;
    private gardenSystem: GardenSystem = null!;
    private economySystem: EconomySystem = null!;
    private uiManager: UIManager = null!;

    onLoad() {
        // 获取所有系统组件
        this.gameManager = this.gameManagerNode.getComponent(GameManager)!;
        this.plantingSystem = this.plantingSystemNode.getComponent(PlantingSystem)!;
        this.gardenSystem = this.gardenSystemNode.getComponent(GardenSystem)!;
        this.economySystem = this.economySystemNode.getComponent(EconomySystem)!;
        this.uiManager = this.uiManagerNode.getComponent(UIManager)!;

        // 依赖注入——双向引用
        this.gameManager.setPlantingSystem(this.plantingSystem);
        this.gameManager.setGardenSystem(this.gardenSystem);
        this.gameManager.setEconomySystem(this.economySystem);
        this.gameManager.setUIManager(this.uiManager);

        this.plantingSystem.setGameManager(this.gameManager);
        this.plantingSystem.setEconomySystem(this.economySystem);
        this.plantingSystem.setUIManager(this.uiManager);

        this.gardenSystem.setGameManager(this.gameManager);
        this.gardenSystem.setEconomySystem(this.economySystem);
        this.gardenSystem.setUIManager(this.uiManager);

        this.economySystem.setGameManager(this.gameManager);
        this.economySystem.setUIManager(this.uiManager);

        this.uiManager.setGameManager(this.gameManager);
        this.uiManager.setPlantingSystem(this.plantingSystem);
        this.uiManager.setGardenSystem(this.gardenSystem);
        this.uiManager.setEconomySystem(this.economySystem);
    }

    start() {
        // 检查离线收益
        const readyCount = this.gardenSystem.calculateOfflineProgress();
        if (readyCount > 0) {
            this.uiManager.showMessage(`欢迎回来！${readyCount} 朵花已盛开！`);
        }

        // 初始化游戏
        this.gameManager.initializeGame();

        console.log('🌻 自动治愈花园启动');
        console.log(`  地块: ${this.gardenSystem.getGardenStats().unlocked}/${GardenSystem.TOTAL_PLOTS}`);
        console.log(`  已种植: ${this.gardenSystem.getGardenStats().planted}`);
    }

    update(deltaTime: number) {
        if (this.gameManager) this.gameManager.update(deltaTime);
        if (this.plantingSystem) this.plantingSystem.update(deltaTime);
        if (this.gardenSystem) this.gardenSystem.update(deltaTime);
    }
}
