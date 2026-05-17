/**
 * GardenController — 花园地块网格控制器
 *
 * Cocos Creator 3.8.8 Component
 * 职责：
 * 1. 管理场景中 4 行 x 6 列 = 24 个 Plot 地块节点
 * 2. 在 start() 中动态创建 Plot 节点（纯代码，无需预制体）
 * 3. 每帧调用每个 Plot 的 grow(deltaTime)
 * 4. 监听 Plot 事件（成熟、收获等）
 * 5. 对外提供 getPlot / getAllPlots / getReadyCount 接口
 */

import { _decorator, Component, Node, Sprite, UITransform, Color, Vec3 } from 'cc';
import { Plot } from './Plot';

const { ccclass, property } = _decorator;

/** 花园地块布局配置（可被 GameConfig 覆盖） */
interface GardenLayoutConfig {
    rows: number;
    cols: number;
    plotWidth: number;
    plotHeight: number;
    gapX: number;
    gapY: number;
    offsetX: number;
    offsetY: number;
    unlockFirstRow: boolean;
}

/** 默认布局参数（无 GameConfig 时使用） */
const DEFAULT_LAYOUT: GardenLayoutConfig = {
    rows: 4,
    cols: 6,
    plotWidth: 80,
    plotHeight: 80,
    gapX: 10,
    gapY: 10,
    offsetX: 0,
    offsetY: 0,
    unlockFirstRow: true,
};

@ccclass('GardenController')
export class GardenController extends Component {
    // ============ 可序列化属性 ============

    @property(Node)
    plotPrefab: Node | null = null;

    @property
    rows: number = DEFAULT_LAYOUT.rows;

    @property
    cols: number = DEFAULT_LAYOUT.cols;

    @property
    plotWidth: number = DEFAULT_LAYOUT.plotWidth;

    @property
    plotHeight: number = DEFAULT_LAYOUT.plotHeight;

    @property
    gapX: number = DEFAULT_LAYOUT.gapX;

    @property
    gapY: number = DEFAULT_LAYOUT.gapY;

    @property
    offsetX: number = DEFAULT_LAYOUT.offsetX;

    @property
    offsetY: number = DEFAULT_LAYOUT.offsetY;

    @property
    defaultColor: Color = new Color(200, 220, 200, 255);

    @property
    lockedColor: Color = new Color(80, 80, 80, 200);

    // ============ 私有状态 ============

    private _plots: Plot[] = [];
    private _plotNodes: Node[] = [];

    /** 总地块数 */
    get totalPlots(): number {
        return this.rows * this.cols;
    }

    // ============ 生命周期 ============

    onLoad(): void {
        // 尝试从 GameConfig 读取布局参数
        this.applyGameConfig();
    }

    start(): void {
        this.createPlotGrid();
        this.bindPlotEvents();
    }

    update(deltaTime: number): void {
        // 每帧驱动所有已种植地块的生长
        for (let i = 0; i < this._plots.length; i++) {
            this._plots[i].grow(deltaTime);
        }
    }

    onDestroy(): void {
        this.unbindPlotEvents();
    }

    // ============ 地块网格创建 ============

    /** 读取 GameConfig 覆盖布局参数（如存在） */
    private applyGameConfig(): void {
        try {
            // 动态引用 GameConfig，避免硬依赖
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const GameConfig = require('../GameConfig');
            if (GameConfig?.GardenLayout) {
                const cfg = GameConfig.GardenLayout as Partial<GardenLayoutConfig>;
                if (cfg.rows !== undefined) this.rows = cfg.rows;
                if (cfg.cols !== undefined) this.cols = cfg.cols;
                if (cfg.plotWidth !== undefined) this.plotWidth = cfg.plotWidth;
                if (cfg.plotHeight !== undefined) this.plotHeight = cfg.plotHeight;
                if (cfg.gapX !== undefined) this.gapX = cfg.gapX;
                if (cfg.gapY !== undefined) this.gapY = cfg.gapY;
                if (cfg.offsetX !== undefined) this.offsetX = cfg.offsetX;
                if (cfg.offsetY !== undefined) this.offsetY = cfg.offsetY;
            }
        } catch {
            // GameConfig 不存在，使用默认布局
        }
    }

    /** 动态创建地块网格 */
    private createPlotGrid(): void {
        const total = this.rows * this.cols;
        const startX = this.offsetX + this.plotWidth / 2;
        const startY = this.offsetY - this.plotHeight / 2;

        for (let i = 0; i < total; i++) {
            const row = Math.floor(i / this.cols);
            const col = i % this.cols;

            const x = startX + col * (this.plotWidth + this.gapX);
            const y = startY - row * (this.plotHeight + this.gapY);

            const node = this.createPlotNode(i, row, col, x, y);
            const plot = node.getComponent(Plot)!;

            // 基本状态
            plot.plotId = i;
            plot.row = row;
            plot.col = col;
            plot.isUnlocked = (row === 0); // 默认只解锁第一行

            this.node.addChild(node);
            this._plots.push(plot);
            this._plotNodes.push(node);
        }
    }

    /** 创建一个 Plot 节点（预制体优先，否则纯代码创建） */
    private createPlotNode(id: number, row: number, col: number, x: number, y: number): Node {
        let node: Node;

        if (this.plotPrefab) {
            // 使用预制体
            node = globalThis.cc.instantiate(this.plotPrefab);
        } else {
            // 纯代码创建
            node = new Node(`Plot_${row}_${col}`);

            // UITransform — 控制尺寸
            const uiTransform = node.addComponent(UITransform);
            uiTransform.setContentSize(this.plotWidth, this.plotHeight);
            uiTransform.setAnchorPoint(0.5, 0.5);

            // Sprite — 显示地块背景
            const sprite = node.addComponent(Sprite);
            sprite.color = this.defaultColor;
            sprite.sizeMode = Sprite.SizeMode.CUSTOM;
        }

        node.setPosition(new Vec3(x, y, 0));

        // 确保 Plot 组件存在
        if (!node.getComponent(Plot)) {
            node.addComponent(Plot);
        }

        return node;
    }

    // ============ 事件绑定 ============

    private _onPlotMature: ((plot: Plot) => void) | null = null;
    private _onPlotHarvested: ((plot: Plot) => void) | null = null;
    private _onPlotPlanted: ((plot: Plot) => void) | null = null;
    private _onPlotUnlocked: ((plot: Plot) => void) | null = null;
    private _onPlotCleared: ((plot: Plot) => void) | null = null;

    private bindPlotEvents(): void {
        this._onPlotMature = (plot: Plot) => {
            this.node.emit('garden-plot-mature', { plot, index: plot.plotId });
        };
        this._onPlotHarvested = (plot: Plot) => {
            this.node.emit('garden-plot-harvested', { plot, index: plot.plotId });
        };
        this._onPlotPlanted = (plot: Plot) => {
            this.node.emit('garden-plot-planted', { plot, index: plot.plotId });
        };
        this._onPlotUnlocked = (plot: Plot) => {
            this.node.emit('garden-plot-unlocked', { plot, index: plot.plotId });
        };
        this._onPlotCleared = (plot: Plot) => {
            this.node.emit('garden-plot-cleared', { plot, index: plot.plotId });
        };

        for (const plot of this._plots) {
            plot.node.on('plot-mature', this._onPlotMature);
            plot.node.on('plot-harvested', this._onPlotHarvested);
            plot.node.on('plot-planted', this._onPlotPlanted);
            plot.node.on('plot-unlocked', this._onPlotUnlocked);
            plot.node.on('plot-cleared', this._onPlotCleared);
        }
    }

    private unbindPlotEvents(): void {
        if (!this._onPlotMature) return;

        for (const plot of this._plots) {
            plot.node.off('plot-mature', this._onPlotMature);
            plot.node.off('plot-harvested', this._onPlotHarvested);
            plot.node.off('plot-planted', this._onPlotPlanted);
            plot.node.off('plot-unlocked', this._onPlotUnlocked);
            plot.node.off('plot-cleared', this._onPlotCleared);
        }

        this._onPlotMature = null;
        this._onPlotHarvested = null;
        this._onPlotPlanted = null;
        this._onPlotUnlocked = null;
        this._onPlotCleared = null;
    }

    // ============ 公开接口 ============

    /** 通过索引获取 Plot 组件（0-based） */
    getPlot(index: number): Plot | undefined {
        return this._plots[index];
    }

    /** 获取所有 Plot 组件数组 */
    getAllPlots(): ReadonlyArray<Plot> {
        return this._plots;
    }

    /** 获取当前已成熟可收获的地块数量 */
    getReadyCount(): number {
        let count = 0;
        for (const plot of this._plots) {
            if (plot.isMature) count++;
        }
        return count;
    }

    /** 获取当前已解锁的地块数量 */
    getUnlockedCount(): number {
        let count = 0;
        for (const plot of this._plots) {
            if (plot.isUnlocked) count++;
        }
        return count;
    }

    /** 获取当前已种植的地块数量 */
    getPlantedCount(): number {
        let count = 0;
        for (const plot of this._plots) {
            if (plot.isPlanted) count++;
        }
        return count;
    }

    /** 获取地块网格布局配置（只读） */
    getLayout(): GardenLayoutConfig {
        return {
            rows: this.rows,
            cols: this.cols,
            plotWidth: this.plotWidth,
            plotHeight: this.plotHeight,
            gapX: this.gapX,
            gapY: this.gapY,
            offsetX: this.offsetX,
            offsetY: this.offsetY,
            unlockFirstRow: true,
        };
    }

    /** 按行列索引获取 Plot */
    getPlotAt(row: number, col: number): Plot | undefined {
        if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return undefined;
        const index = row * this.cols + col;
        return this._plots[index];
    }

    /** 从存档数据恢复所有地块状态 */
    deserializeAll(data: Array<{ id: number; unlocked: boolean; planted: boolean; plantTypeId?: number | null; elapsedGrowTime?: number }>): void {
        if (!data) return;
        for (const entry of data) {
            const plot = this._plots[entry.id];
            if (!plot) continue;
            plot.deserialize(entry);
        }
    }

    /** 序列化所有地块数据 */
    serializeAll(): object[] {
        return this._plots.map(p => p.serialize());
    }
}
