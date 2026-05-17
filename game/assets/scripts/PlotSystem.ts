/**
 * PlotSystem.ts — 地块网格系统 (P0 移植)
 *
 * 从 Canvas 2D (src/game.js) 移植到 Cocos Creator 3.8.8
 * 功能：创建 4×6=24 格地块网格，管理锁定/解锁、种植/生长/成熟状态
 *
 * 设计原则：
 * - 纯逻辑层，零 Canvas 2D 依赖
 * - 数据驱动：所有状态存于 PlotData，节点仅是渲染层
 * - 通过事件与 GameManager/EconomySystem/PlantingSystem 交互
 */

import { _decorator, Component, Node, Sprite, Color, UITransform, Vec3, EventTouch, Touch, Size, v3 } from 'cc';
import { StorageUtil } from './utils/StorageUtil';
const { ccclass, property } = _decorator;

// ==================== 类型定义 ====================

export enum PlotState {
    LOCKED = 'locked',
    EMPTY = 'empty',
    PLANTED = 'planted',
    GROWING = 'growing',
    BLOOMING = 'blooming',
    READY = 'ready',
}

export interface PlotFlowerData {
    type: string;          // 花朵类型ID: 'sunflower' | 'tulip' | 'rose' | 'daisy' | 'lavender'
    level: number;         // 合成等级 (1-5)
    plantedAt: number;     // 种植时间戳 (ms)
    growthDuration: number; // 生长总时长 (ms)
    progress: number;       // 生长进度 0-1
}

export interface PlotData {
    id: number;
    row: number;
    col: number;
    state: PlotState;
    isUnlocked: boolean;
    unlockLevel: number;
    flower: PlotFlowerData | null;
    node: Node | null;
}

export interface PlotConfig {
    rows: number;
    cols: number;
    marginX: number;
    marginY: number;
    gapX: number;
    gapY: number;
    initialUnlocked: number;
}

// ==================== 事件类型 ====================

export const PlotEvent = {
    PLOT_TAPPED: 'plot-tapped',
    PLANT_PLACED: 'plant-placed',
    FLOWER_GROWN: 'flower-grown',
    FLOWER_READY: 'flower-ready',
    FLOWER_HARVESTED: 'flower-harvested',
    PLOT_UNLOCKED: 'plot-unlocked',
};

// ==================== 花卉配置 ====================

export interface FlowerTypeConfig {
    id: string;
    name: string;
    growthTime: number;     // 生长时间 (秒)
    reward: number;         // 收获金币
    price: number;          // 种子价格
    color: string;          // 主色调
    unlockLevel: number;    // 解锁等级
    colorR: number;         // Cocos Creator Color R
    colorG: number;         // Cocos Creator Color G
    colorB: number;         // Cocos Creator Color B
}

export const FLOWER_TYPES: FlowerTypeConfig[] = [
    { id: 'sunflower', name: '向日葵', growthTime: 300, reward: 10, price: 5,  color: '#FFD700', unlockLevel: 1, colorR: 255, colorG: 215, colorB: 0 },
    { id: 'tulip',    name: '郁金香', growthTime: 600, reward: 20, price: 10, color: '#FF69B4', unlockLevel: 1, colorR: 255, colorG: 105, colorB: 180 },
    { id: 'rose',     name: '玫瑰',   growthTime: 1800, reward: 50, price: 25, color: '#E53935', unlockLevel: 2, colorR: 229, colorG: 57,  colorB: 53 },
    { id: 'daisy',    name: '小雏菊', growthTime: 900, reward: 30, price: 15, color: '#FFFFFF', unlockLevel: 3, colorR: 255, colorG: 255, colorB: 255 },
    { id: 'lavender', name: '薰衣草', growthTime: 3600, reward: 100, price: 50, color: '#9C27B0', unlockLevel: 5, colorR: 156, colorG: 39,  colorB: 176 },
];

// ==================== 主题颜色 (匹配治愈花园风格) ====================

export const THEME = {
    skyTop:     new Color(224, 247, 250),   // '#E0F7FA'
    skyBottom:  new Color(178, 235, 242),   // '#B2EBF2'
    grassTop:   new Color(200, 230, 201),   // '#C8E6C9'
    grassBot:   new Color(165, 214, 167),   // '#A5D6A7'
    soil:       new Color(141, 110, 99),    // '#8D6E63'
    soilTex:    new Color(121, 85, 72),     // '#795548'
    fence:      new Color(255, 255, 255),   // '#FFFFFF'
    path:       new Color(245, 245, 220),   // '#F5F5DC'
    plotBorder: new Color(93, 64, 55),      // '#5D4037'
    plotLocked: new Color(189, 189, 189, 128), // rgba(189,189,189,0.5)
    foreGrass:  new Color(129, 199, 132),   // '#81C784'
    gold:       new Color(255, 215, 0),     // '#FFD700'
    grassDark:  new Color(56, 142, 60),     // '#388E3C'
    textGray:   new Color(102, 102, 102),   // '#666666'
    textGreen:  new Color(85, 139, 47),     // '#558B2F'
    textRed:    new Color(229, 57, 53),     // '#E53935'
};

// ==================== PlotSystem 组件 ====================

@ccclass('PlotSystem')
export class PlotSystem extends Component {

    // --- 属性：可在编辑器调整 ---

    @property
    rows: number = 4;

    @property
    cols: number = 6;

    @property
    marginX: number = 12;

    @property
    marginTop: number = 120;   // 顶部导航栏+远景高度

    @property
    marginBottom: number = 100; // 底部功能栏高度

    @property
    gapX: number = 8;

    @property
    gapY: number = 12;

    @property
    initialUnlocked: number = 6;

    // --- 系统引用 ---

    private _gameManager: any = null;
    private _economySystem: any = null;
    private _uiManager: any = null;

    private _plots: PlotData[] = [];
    private _gardenContainer: Node | null = null;
    private _lastUpdateTime: number = 0;
    private _selectedPlotId: number = -1;
    private _gardenWidth: number = 0;
    private _gardenHeight: number = 0;
    private _plotWidth: number = 0;
    private _plotHeight: number = 0;

    // 花卉视觉节点
    private _flowerVisuals: Map<number, Node> = new Map();

    // ==================== 生命周期 ====================

    onLoad() {
        this._lastUpdateTime = Date.now();
        this._gardenContainer = new Node('GardenContainer');
        this.node.addChild(this._gardenContainer);
    }

    start() {
        this.calculateLayout();
        this.createPlots();
        this.loadPlotData();
        this.schedule(this.tickGrowth, 1.0); // 每秒更新生长
    }

    onDestroy() {
        this.unschedule(this.tickGrowth);
        this.clearAllFlowerVisuals();
    }

    // ==================== 布局计算 ====================

    private calculateLayout() {
        const canvasSize = this.node.getComponent(UITransform);
        const canvasWidth = canvasSize ? canvasSize.width : 750;
        const canvasHeight = canvasSize ? canvasSize.height : 1334;

        this._gardenWidth = canvasWidth - this.marginX * 2;
        this._gardenHeight = canvasHeight - this.marginTop - this.marginBottom;
        this._plotWidth = (this._gardenWidth - (this.cols - 1) * this.gapX) / this.cols;
        this._plotHeight = (this._gardenHeight - (this.rows - 1) * this.gapY) / this.rows;
    }

    private getPlotPosition(row: number, col: number): Vec3 {
        const x = this.marginX + col * (this._plotWidth + this.gapX) + this._plotWidth / 2;
        const y = -(this.marginTop + row * (this._plotHeight + this.gapY) + this._plotHeight / 2);
        return v3(x, y, 0);
    }

    // ==================== 创建地块网格 ====================

    private createPlots() {
        let plotIndex = 0;

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const isUnlocked = plotIndex < this.initialUnlocked;
                const unlockLevel = Math.ceil(plotIndex / this.cols);

                // 创建地块节点
                const plotNode = new Node(`Plot_${plotIndex}`);
                this._gardenContainer!.addChild(plotNode);

                // 位置
                plotNode.setPosition(this.getPlotPosition(row, col));

                // 尺寸
                const transform = plotNode.addComponent(UITransform);
                transform.setContentSize(this._plotWidth, this._plotHeight);
                transform.setAnchorPoint(0.5, 0.5);

                // 精灵组件
                const sprite = plotNode.addComponent(Sprite);
                sprite.type = Sprite.Type.SIMPLE;
                sprite.sizeMode = Sprite.SizeMode.CUSTOM;

                // 数据
                const plotData: PlotData = {
                    id: plotIndex,
                    row,
                    col,
                    state: isUnlocked ? PlotState.EMPTY : PlotState.LOCKED,
                    isUnlocked,
                    unlockLevel,
                    flower: null,
                    node: plotNode,
                };

                this._plots.push(plotData);

                // 触摸事件
                plotNode.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
                    this.onPlotTap(plotData.id);
                });

                // 渲染初始状态
                this.renderPlot(plotData);

                plotIndex++;
            }
        }

        console.log(`[PlotSystem] 创建 ${this._plots.length} 个地块，初始解锁 ${this.initialUnlocked} 个`);
    }

    // ==================== 花卉视觉管理 ====================

    private createFlowerVisual(plot: PlotData) {
        if (!plot.node || !plot.flower) return;
        this.removeFlowerVisual(plot.id);

        const flowerNode = new Node(`Flower_${plot.id}`);
        plot.node.addChild(flowerNode);
        flowerNode.setPosition(v3(0, 0, 0));

        const visual = flowerNode.addComponent(FlowerVisual);
        const plotSize = plot.node.getComponent(UITransform);
        const visualSize = plotSize ? Math.min(plotSize.width, plotSize.height) * 0.7 : 40;
        visual.setFlower({ type: plot.flower.type, progress: plot.flower.progress, size: visualSize });

        this._flowerVisuals.set(plot.id, flowerNode);
    }

    private removeFlowerVisual(plotId: number) {
        const n = this._flowerVisuals.get(plotId);
        if (n) { n.destroy(); this._flowerVisuals.delete(plotId); }
    }

    private updateFlowerVisual(plot: PlotData) {
        const v = this._flowerVisuals.get(plot.id)?.getComponent(FlowerVisual);
        if (v && plot.flower) v.updateProgress(plot.flower.progress);
    }

    private clearAllFlowerVisuals() {
        for (const [, n] of this._flowerVisuals) n.destroy();
        this._flowerVisuals.clear();
    }

    // ==================== 渲染地块 ====================

    private renderPlot(plot: PlotData) {
        const sprite = plot.node?.getComponent(Sprite);
        if (!sprite) return;

        switch (plot.state) {
            case PlotState.LOCKED:
                sprite.color = THEME.plotLocked;
                this.removeFlowerVisual(plot.id);
                break;
            case PlotState.EMPTY:
                sprite.color = THEME.soil;
                this.removeFlowerVisual(plot.id);
                break;
            default:
                sprite.color = THEME.soil;
                if (!this._flowerVisuals.has(plot.id)) this.createFlowerVisual(plot);
                this.updateFlowerVisual(plot);
                break;
        }
    }

    // ==================== 触摸交互 ====================

    private onPlotTap(plotId: number) {
        const plot = this._plots.find(p => p.id === plotId);
        if (!plot) return;

        this.node.emit(PlotEvent.PLOT_TAPPED, plot);

        switch (plot.state) {
            case PlotState.LOCKED:
                this.handleLockedTap(plot);
                break;

            case PlotState.EMPTY:
                this.handleEmptyTap(plot);
                break;

            case PlotState.READY:
                this.handleReadyTap(plot);
                break;

            case PlotState.PLANTED:
            case PlotState.GROWING:
            case PlotState.BLOOMING:
                this.handleGrowingTap(plot);
                break;
        }
    }

    private handleLockedTap(plot: PlotData) {
        console.log(`[PlotSystem] 地块 ${plot.id} 锁定中，需 ${plot.unlockLevel + 1} 级解锁`);
    }

    private handleEmptyTap(plot: PlotData) {
        this._selectedPlotId = plot.id;
        this.node.emit('request-plant-selection', plot);
    }

    private handleReadyTap(plot: PlotData) {
        this.harvestFlower(plot.id);
    }

    private handleGrowingTap(plot: PlotData) {
        if (plot.flower) {
            const progress = Math.round(plot.flower.progress * 100);
            console.log(`[PlotSystem] 地块 ${plot.id} 种植中: ${progress}%`);
        }
    }

    // ==================== 种植接口 ====================

    plantFlower(plotId: number, flowerTypeId: string): boolean {
        const plot = this._plots.find(p => p.id === plotId);
        if (!plot || plot.state !== PlotState.EMPTY) return false;

        const flowerType = FLOWER_TYPES.find(f => f.id === flowerTypeId);
        if (!flowerType) return false;

        const gm = this.getGameManager();
        if (gm && gm.level < flowerType.unlockLevel) {
            console.log(`[PlotSystem] 需要等级 ${flowerType.unlockLevel} 解锁 ${flowerType.name}`);
            return false;
        }

        if (gm && !gm.spendCoins(flowerType.price)) {
            console.log(`[PlotSystem] 金币不足，需要 ${flowerType.price}`);
            return false;
        }

        const now = Date.now();
        plot.flower = {
            type: flowerTypeId,
            level: 1,
            plantedAt: now,
            growthDuration: flowerType.growthTime * 1000,
            progress: 0,
        };
        plot.state = PlotState.PLANTED;

        this.createFlowerVisual(plot);
        this.renderPlot(plot);
        this.savePlotData();

        this.node.emit(PlotEvent.PLANT_PLACED, { plotId, flowerType: flowerTypeId });
        console.log(`[PlotSystem] 地块 ${plotId} 种植 ${flowerType.name}`);

        return true;
    }

    // ==================== 生长更新 ====================

    private tickGrowth(dt: number) {
        const now = Date.now();
        let changed = false;

        for (const plot of this._plots) {
            if (!plot.flower || !plot.isUnlocked) continue;
            if (plot.state === PlotState.READY || plot.state === PlotState.EMPTY) continue;

            const elapsed = now - plot.flower.plantedAt;
            const newProgress = Math.min(elapsed / plot.flower.growthDuration, 1);

            if (newProgress !== plot.flower.progress) {
                plot.flower.progress = newProgress;
                changed = true;
            }

            if (newProgress >= 1 && plot.state !== PlotState.READY) {
                plot.state = PlotState.READY;
                this.node.emit(PlotEvent.FLOWER_READY, { plotId: plot.id, flower: plot.flower });
                console.log(`[PlotSystem] 地块 ${plot.id} 花卉已成熟`);
            } else if (newProgress >= 0.7 && plot.state !== PlotState.BLOOMING && plot.state !== PlotState.READY) {
                plot.state = PlotState.BLOOMING;
                this.node.emit(PlotEvent.FLOWER_GROWN, { plotId: plot.id, stage: 'blooming' });
            } else if (newProgress >= 0.3 && plot.state !== PlotState.GROWING && plot.state !== PlotState.BLOOMING) {
                plot.state = PlotState.GROWING;
                this.node.emit(PlotEvent.FLOWER_GROWN, { plotId: plot.id, stage: 'growing' });
            }

            if (changed) {
                this.renderPlot(plot);
            } else if (plot.flower && plot.flower.progress < 1) {
                this.updateFlowerVisual(plot);
            }
        }

        if (changed) {
            this.savePlotData();
        }
    }

    // ==================== 收获 ====================

    harvestFlower(plotId: number): boolean {
        const plot = this._plots.find(p => p.id === plotId);
        if (!plot || plot.state !== PlotState.READY || !plot.flower) return false;

        const flowerType = FLOWER_TYPES.find(f => f.id === plot.flower!.type);
        if (!flowerType) return false;

        let reward = flowerType.reward;
        if (plot.flower.level > 1) {
            reward = Math.floor(reward * (1 + (plot.flower.level - 1) * 0.5));
        }

        const gm = this.getGameManager();
        if (gm) {
            gm.addCoins(reward);
            gm.addExperience(Math.floor(reward * 0.5));
        }

        const harvestedFlower = { ...plot.flower };

        this.removeFlowerVisual(plot.id);
        plot.flower = null;
        plot.state = PlotState.EMPTY;
        this.renderPlot(plot);
        this.savePlotData();

        this.node.emit(PlotEvent.FLOWER_HARVESTED, { plotId, flower: harvestedFlower, reward });
        console.log(`[PlotSystem] 收获地块 ${plotId}，获得 ${reward} 金币`);

        return true;
    }

    // ==================== 解锁 ====================

    unlockPlot(plotId: number): boolean {
        const plot = this._plots.find(p => p.id === plotId);
        if (!plot || plot.isUnlocked) return false;

        plot.isUnlocked = true;
        plot.state = PlotState.EMPTY;
        this.renderPlot(plot);
        this.savePlotData();

        this.node.emit(PlotEvent.PLOT_UNLOCKED, { plotId });
        return true;
    }

    checkUnlocksByLevel(level: number) {
        let unlocked = 0;
        for (const plot of this._plots) {
            const requiredLevel = plot.unlockLevel + 1;
            if (!plot.isUnlocked && level >= requiredLevel) {
                plot.isUnlocked = true;
                plot.state = PlotState.EMPTY;
                this.renderPlot(plot);
                unlocked++;
            }
        }
        if (unlocked > 0) {
            this.savePlotData();
            console.log(`[PlotSystem] 等级 ${level} 解锁了 ${unlocked} 个新地块`);
        }
    }

    // ==================== 查询 ====================

    getPlot(plotId: number): PlotData | undefined {
        return this._plots.find(p => p.id === plotId);
    }

    getAllPlots(): PlotData[] {
        return [...this._plots];
    }

    getEmptyPlots(): PlotData[] {
        return this._plots.filter(p => p.state === PlotState.EMPTY);
    }

    getReadyPlots(): PlotData[] {
        return this._plots.filter(p => p.state === PlotState.READY);
    }

    getSelectedPlotId(): number {
        return this._selectedPlotId;
    }

    clearSelection() {
        this._selectedPlotId = -1;
    }

    getAvailableFlowerTypes(level: number): FlowerTypeConfig[] {
        return FLOWER_TYPES.filter(f => f.unlockLevel <= level);
    }

    // ==================== 存储 ====================

    savePlotData() {
        const plotData = this._plots.map(p => ({
            id: p.id,
            state: p.state,
            isUnlocked: p.isUnlocked,
            flower: p.flower,
        }));
        StorageUtil.set('plot_system_data', plotData);
    }

    loadPlotData() {
        const saved = StorageUtil.get<any[]>('plot_system_data');
        if (!saved || !Array.isArray(saved)) return;

        for (const savedPlot of saved) {
            const plot = this._plots.find(p => p.id === savedPlot.id);
            if (!plot) continue;

            plot.state = savedPlot.state || (savedPlot.isUnlocked ? PlotState.EMPTY : PlotState.LOCKED);
            plot.isUnlocked = savedPlot.isUnlocked ?? (plot.id < this.initialUnlocked);
            plot.flower = savedPlot.flower || null;
            this.renderPlot(plot);
        }

        console.log(`[PlotSystem] 加载 ${saved.length} 个地块状态`);
    }

    resetAllPlots() {
        this.clearAllFlowerVisuals();
        for (const plot of this._plots) {
            plot.isUnlocked = plot.id < this.initialUnlocked;
            plot.state = plot.isUnlocked ? PlotState.EMPTY : PlotState.LOCKED;
            plot.flower = null;
            this.renderPlot(plot);
        }
        this.savePlotData();
    }

    // ==================== 一键收获 ====================

    harvestAll(): number {
        let totalReward = 0;
        let count = 0;

        for (const plot of this._plots) {
            if (plot.state === PlotState.READY) {
                const result = this.harvestFlower(plot.id);
                if (result) {
                    const flowerType = FLOWER_TYPES.find(f => f.id === plot.flower?.type);
                    if (flowerType) {
                        totalReward += flowerType.reward;
                        count++;
                    }
                }
            }
        }

        console.log(`[PlotSystem] 一键收获: ${count} 朵花，共 ${totalReward} 金币`);
        return totalReward;
    }

    // ==================== 系统引用 ====================

    setGameManager(gm: any) { this._gameManager = gm; }
    setEconomySystem(es: any) { this._economySystem = es; }
    setUIManager(ui: any) { this._uiManager = ui; }

    private getGameManager(): any {
        return this._gameManager || (window as any).GameManager?.instance;
    }

    get gameManager(): any { return this._gameManager; }
    get economySystem(): any { return this._economySystem; }
    get uiManager(): any { return this._uiManager; }

    update(deltaTime: number) {
        // 预留：未来添加动画和特效
    }
}
