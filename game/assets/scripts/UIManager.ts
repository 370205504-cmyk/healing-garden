import { _decorator, Component, Node, Label, ProgressBar, Sprite, Button, Color } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UIManager')
export class UIManager extends Component {
    @property(Label)
    coinsLabel: Label = null!;

    @property(Label)
    levelLabel: Label = null!;

    @property(ProgressBar)
    expProgress: ProgressBar = null!;

    @property(Label)
    expLabel: Label = null!;

    @property(Label)
    messageLabel: Label = null!;

    @property(Node)
    shopPanel: Node = null!;

    @property(Node)
    gardenPanel: Node = null!;

    private _gameManager: any = null;
    private _plantingSystem: any = null;
    private _gardenSystem: any = null;
    private _economySystem: any = null;

    private activePanel: Node = null!;
    private messageTimer: number = 0;

    onLoad() {
        this.initUI();
        this.setupEventListeners();
        this.showPanel(this.gardenPanel);
    }

    initUI() {
        this.updateCoins(100);
        this.updateLevel(1, 0, 100);

        if (this.messageLabel) this.messageLabel.node.active = false;
    }

    setupEventListeners() {
        // 监听游戏管理器的全局事件
        if (this._gameManager?.node) {
            this._gameManager.node.on('coins-updated', (coins: number) => this.updateCoins(coins));
            this._gameManager.node.on('level-up', (level: number) => {
                this.updateLevel(level, this._gameManager.experience, this._gameManager.requiredExperience);
            });
        }
    }

    updateCoins(coins: number) {
        if (this.coinsLabel) {
            this.coinsLabel.string = `💰 ${coins}`;
        }
    }

    updateLevel(level: number, currentExp: number, maxExp: number) {
        if (this.levelLabel) {
            this.levelLabel.string = `Lv.${level}`;
        }
        if (this.expProgress) {
            this.expProgress.progress = maxExp > 0 ? currentExp / maxExp : 0;
        }
        if (this.expLabel) {
            this.expLabel.string = `${currentExp}/${maxExp}`;
        }
    }

    showPanel(panel: Node) {
        if (this.activePanel) this.activePanel.active = false;
        if (panel) {
            panel.active = true;
            this.activePanel = panel;
        }
    }

    /** 显示浮动消息 */
    showMessage(text: string, duration: number = 2) {
        if (!this.messageLabel) return;

        this.messageLabel.string = text;
        this.messageLabel.node.active = true;
        this.messageTimer = duration;

        // 延迟隐藏
        this.scheduleOnce(() => {
            if (this.messageLabel) this.messageLabel.node.active = false;
        }, duration);
    }

    /** 更新花园地块UI */
    updateGardenUI(stats: { total: number; unlocked: number; planted: number; ready: number }) {
        // 由开发者绑定具体UI组件
    }

    setGameManager(gm: any) {
        this._gameManager = gm;
        if (gm?.node) {
            gm.node.on('coins-updated', (coins: number) => this.updateCoins(coins));
            gm.node.on('level-up', (level: number) => {
                const exp = gm.experience ?? 0;
                const required = gm.requiredExperience ?? 100;
                this.updateLevel(level, exp, required);
            });
        }
    }

    setPlantingSystem(ps: any) { this._plantingSystem = ps; }
    setGardenSystem(gs: any) { this._gardenSystem = gs; }
    setEconomySystem(es: any) { this._economySystem = es; }

    get gameManager(): any { return this._gameManager; }
    get plantingSystem(): any { return this._plantingSystem; }
    get gardenSystem(): any { return this._gardenSystem; }
    get economySystem(): any { return this._economySystem; }

    update(deltaTime: number) {}
}
