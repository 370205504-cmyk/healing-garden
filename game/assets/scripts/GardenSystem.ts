import { _decorator, Component, Node, Vec3, tween, v3 } from 'cc';
import { FlowerData, getFlowerType } from './FlowerConfig';
import { StorageUtil } from './utils/StorageUtil';

const { ccclass, property } = _decorator;

// 地块状态
export interface PlotData {
    id: number;             // 0-23
    row: number;            // 0-5
    col: number;            // 0-3
    unlocked: boolean;
    flower: FlowerData | null;
}

@ccclass('GardenSystem')
export class GardenSystem extends Component {
    public static readonly GRID_ROWS = 6;
    public static readonly GRID_COLS = 4;
    public static readonly TOTAL_PLOTS = 24;

    @property(Node)
    plotPrefab: Node = null!;  // 地块预制体（编辑器拖入）

    private _plots: PlotData[] = [];
    private _gameManager: any = null;
    private _economySystem: any = null;
    private _uiManager: any = null;

    onLoad() {
        this.initPlots();
        this.loadGardenData();
    }

    /** 初始化24个地块 */
    initPlots() {
        this._plots = [];
        for (let i = 0; i < GardenSystem.TOTAL_PLOTS; i++) {
            const row = Math.floor(i / GardenSystem.GRID_COLS);
            const col = i % GardenSystem.GRID_COLS;
            this._plots.push({
                id: i,
                row,
                col,
                unlocked: row === 0, // 默认只解锁第一行（4个地块）
                flower: null
            });
        }
    }

    /** 获取所有地块 */
    get plots(): PlotData[] {
        return this._plots;
    }

    /** 获取地块数据 */
    getPlot(plotId: number): PlotData | undefined {
        return this._plots[plotId];
    }

    /** 在地块上种植 */
    plantFlower(plotId: number, flowerTypeId: string): boolean {
        const plot = this._plots[plotId];
        if (!plot || !plot.unlocked || plot.flower) return false;

        const flowerType = getFlowerType(flowerTypeId);
        if (!flowerType) return false;

        // 检查金币
        if (this._economySystem) {
            if (!this._economySystem.spendCoins(flowerType.price)) {
                this._uiManager?.showMessage('金币不足！');
                return false;
            }
        }

        // 创建花卉数据
        plot.flower = {
            type: flowerTypeId,
            growthStartTime: Date.now(),
            growthDuration: flowerType.growthTime * 1000,
            progress: 0,
            state: 'growing',
            plantedPlot: plotId
        };

        this.node.emit('flower-planted', { plotId, flower: plot.flower });
        this.saveGardenData();
        return true;
    }

    /** 收获花卉 */
    harvestFlower(plotId: number): boolean {
        const plot = this._plots[plotId];
        if (!plot?.flower || plot.flower.state !== 'ready') return false;

        const flowerType = getFlowerType(plot.flower.type);
        if (flowerType && this._economySystem) {
            this._economySystem.addCoins(flowerType.reward);
            this._uiManager?.showMessage(`收获 ${flowerType.name}！+${flowerType.reward} 金币`);
        }

        // 添加经验
        this._gameManager?.addExperience(20);

        // 清除地块
        plot.flower = null;
        this.node.emit('flower-harvested', { plotId });
        this.saveGardenData();
        return true;
    }

    /** 解锁新地块 */
    unlockPlot(plotId: number, cost: number): boolean {
        const plot = this._plots[plotId];
        if (!plot || plot.unlocked) return false;

        if (this._economySystem && !this._economySystem.spendCoins(cost)) {
            this._uiManager?.showMessage('金币不足，无法解锁！');
            return false;
        }

        plot.unlocked = true;
        this.node.emit('plot-unlocked', { plotId });
        this.saveGardenData();
        return true;
    }

    /** 更新所有花卉生长进度 */
    updateFlowers(deltaTime: number) {
        const now = Date.now();
        for (const plot of this._plots) {
            if (!plot.flower) continue;

            const elapsed = now - plot.flower.growthStartTime;
            plot.flower.progress = Math.min(1, elapsed / plot.flower.growthDuration);

            if (plot.flower.progress >= 1 && plot.flower.state === 'growing') {
                plot.flower.state = 'ready';
                this.node.emit('flower-ready', { plotId: plot.id });
            }
        }
    }

    /** 计算离线时间并获得补偿 */
    calculateOfflineProgress(): number {
        const offlineGrowthKey = 'offline_growth_check';
        const lastCheck = StorageUtil.get<number>(offlineGrowthKey) || Date.now();
        const now = Date.now();
        const elapsed = now - lastCheck; // 毫秒

        // 更新所有花卉的离线进度
        let harvestedCount = 0;
        for (const plot of this._plots) {
            if (!plot.flower || plot.flower.state === 'ready') continue;

            plot.flower.growthStartTime = now - (elapsed % plot.flower.growthDuration);
            plot.flower.progress = Math.min(1, elapsed / plot.flower.growthDuration);

            if (plot.flower.progress >= 1) {
                plot.flower.state = 'ready';
                harvestedCount++;
            }
        }

        StorageUtil.set(offlineGrowthKey, now);
        this.saveGardenData();
        return harvestedCount;
    }

    /** 获取花园统计 */
    getGardenStats() {
        const total = this._plots.length;
        const unlocked = this._plots.filter(p => p.unlocked).length;
        const planted = this._plots.filter(p => p.flower).length;
        const ready = this._plots.filter(p => p.flower?.state === 'ready').length;

        return { total, unlocked, planted, ready };
    }

    /** 保存花园数据 */
    saveGardenData() {
        StorageUtil.set('garden_data_v2', {
            plots: this._plots.map(p => ({
                id: p.id,
                unlocked: p.unlocked,
                flower: p.flower ? {
                    type: p.flower.type,
                    growthStartTime: p.flower.growthStartTime,
                    growthDuration: p.flower.growthDuration,
                    progress: p.flower.progress,
                    state: p.flower.state,
                    plantedPlot: p.flower.plantedPlot
                } : null
            }))
        });
    }

    /** 加载花园数据 */
    loadGardenData() {
        const data = StorageUtil.get<{ plots: any[] }>('garden_data_v2');
        if (data?.plots) {
            for (const savedPlot of data.plots) {
                const plot = this._plots[savedPlot.id];
                if (plot) {
                    plot.unlocked = savedPlot.unlocked;
                    plot.flower = savedPlot.flower;
                }
            }
        }
    }

    /** 系统引用设置 */
    setGameManager(gm: any) { this._gameManager = gm; }
    setEconomySystem(es: any) { this._economySystem = es; }
    setUIManager(ui: any) { this._uiManager = ui; }

    get gameManager(): any { return this._gameManager; }
    get economySystem(): any { return this._economySystem; }
    get uiManager(): any { return this._uiManager; }

    update(deltaTime: number) {
        this.updateFlowers(deltaTime);
    }
}
