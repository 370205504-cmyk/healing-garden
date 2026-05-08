import { _decorator, Component, Node, Label, ProgressBar, Sprite, Button } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UIManager')
export class UIManager extends Component {
    
    // 系统引用
    private _gameManager: any = null;
    private _plantingSystem: any = null;
    private _gardenSystem: any = null;
    private _economySystem: any = null;
    
    // UI组件引用
    @property(Label)
    coinsLabel: Label = null;
    
    @property(Label)
    levelLabel: Label = null;
    
    @property(ProgressBar)
    expProgress: ProgressBar = null;
    
    @property(Label)
    expLabel: Label = null;
    
    @property(Node)
    shopPanel: Node = null;
    
    @property(Node)
    inventoryPanel: Node = null;
    
    @property(Node)
    gardenPanel: Node = null;
    
    @property(Button)
    shopButton: Button = null;
    
    @property(Button)
    inventoryButton: Button = null;
    
    @property(Button)
    gardenButton: Button = null;
    
    // 当前激活的面板
    private activePanel: Node = null;
    
    onLoad() {
        this.initUI();
        this.setupEventListeners();
        
        // 默认显示花园面板
        this.showPanel(this.gardenPanel);
    }
    
    initUI() {
        // 初始化UI状态
        this.updateCoins(100);
        this.updateLevel(1, 0, 100);
    }
    
    setupEventListeners() {
        // 按钮点击事件
        if (this.shopButton) {
            this.shopButton.node.on(Button.EventType.CLICK, () => {
                this.showPanel(this.shopPanel);
            });
        }
        
        if (this.inventoryButton) {
            this.inventoryButton.node.on(Button.EventType.CLICK, () => {
                this.showPanel(this.inventoryPanel);
            });
        }
        
        if (this.gardenButton) {
            this.gardenButton.node.on(Button.EventType.CLICK, () => {
                this.showPanel(this.gardenPanel);
            });
        }
        
        // 监听游戏事件
        const gameManager = (window as any).GameManager?.instance;
        if (gameManager) {
            gameManager.node.on('coins-updated', this.updateCoins, this);
            gameManager.node.on('level-up', this.updateLevel, this);
        }
    }
    
    // 更新金币显示
    updateCoins(coins: number) {
        if (this.coinsLabel) {
            this.coinsLabel.string = `金币: ${coins}`;
        }
    }
    
    // 更新等级显示
    updateLevel(level: number, currentExp: number, maxExp: number) {
        if (this.levelLabel) {
            this.levelLabel.string = `等级: ${level}`;
        }
        
        if (this.expProgress) {
            this.expProgress.progress = currentExp / maxExp;
        }
        
        if (this.expLabel) {
            this.expLabel.string = `${currentExp}/${maxExp}`;
        }
    }
    
    // 显示面板
    showPanel(panel: Node) {
        // 隐藏当前面板
        if (this.activePanel) {
            this.activePanel.active = false;
        }
        
        // 显示新面板
        if (panel) {
            panel.active = true;
            this.activePanel = panel;
        }
    }
    
    // 显示消息提示
    showMessage(text: string, duration: number = 2) {
        // 这里可以实现一个消息提示系统
        console.log(`UI消息: ${text}`);
        
        // 可以创建一个临时的消息节点
        // 暂时用控制台输出代替
    }
    
    // 显示确认对话框
    showConfirm(message: string, onConfirm: Function, onCancel: Function = null) {
        // 这里可以实现一个确认对话框
        console.log(`确认对话框: ${message}`);
        
        // 简单实现：直接调用确认函数
        if (confirm(message)) {
            onConfirm && onConfirm();
        } else {
            onCancel && onCancel();
        }
    }
    
    // 更新商店UI
    updateShopUI(shopItems: any[]) {
        // 更新商店物品列表
        // 这里可以实现动态生成商店物品UI
        console.log(`更新商店UI，物品数量: ${shopItems.length}`);
    }
    
    // 更新背包UI
    updateInventoryUI(inventory: Map<number, number>) {
        // 更新背包物品列表
        console.log(`更新背包UI，物品种类: ${inventory.size}`);
    }
    
    // 显示加载界面
    showLoading(show: boolean, message: string = '加载中...') {
        // 显示或隐藏加载界面
        if (show) {
            console.log(`显示加载界面: ${message}`);
        } else {
            console.log('隐藏加载界面');
        }
    }
    
    // 系统引用设置
    setGameManager(gameManager: any) {
        this._gameManager = gameManager;
    }
    
    setPlantingSystem(plantingSystem: any) {
        this._plantingSystem = plantingSystem;
    }
    
    setGardenSystem(gardenSystem: any) {
        this._gardenSystem = gardenSystem;
    }
    
    setEconomySystem(economySystem: any) {
        this._economySystem = economySystem;
    }
    
    // 获取系统引用
    get gameManager(): any {
        return this._gameManager;
    }
    
    get plantingSystem(): any {
        return this._plantingSystem;
    }
    
    get gardenSystem(): any {
        return this._gardenSystem;
    }
    
    get economySystem(): any {
        return this._economySystem;
    }
    
    // 更新循环
    update(deltaTime: number) {
        // UI管理器定期更新逻辑
    }
}