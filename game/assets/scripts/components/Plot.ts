/**
 * Plot — 单个地块组件
 *
 * Cocos Creator 3.8 Component
 * 管理地块的锁定/种植/生长状态，用 deltaTime 累计替代 setTimeout
 */

import { _decorator, Component, Node, UITransform, Vec3 } from 'cc';
import { GrowthStage, getFlowerType, FlowerTypeDef } from '../data/FlowerTypes';
const { ccclass, property } = _decorator;

@ccclass('Plot')
export class Plot extends Component {
    // ============ 公开序列化属性 ============

    @property
    plotId: number = -1;

    @property
    row: number = 0;

    @property
    col: number = 0;

    @property
    isUnlocked: boolean = false;

    @property
    isPlanted: boolean = false;

    // ============ 私有状态 ============

    private _plantTypeId: number | null = null;
    private _growthStage: GrowthStage = GrowthStage.Seed;
    private _elapsedGrowTime: number = 0;
    private _totalGrowTime: number = 0;
    private _isMature: boolean = false;
    private _stageThresholds: number[] = [];
    private _uiTransform: UITransform | null = null;

    // ============ 生命周期 ============

    onLoad() {
        this._uiTransform = this.getComponent(UITransform);
        this.updateVisualState();
    }

    // ============ 公开方法 ============

    /** 解锁地块 */
    unlock(): void {
        if (this.isUnlocked) return;
        this.isUnlocked = true;
        this.updateVisualState();
        this.node.emit('plot-unlocked', this);
    }

    /**
     * 种植指定类型的花朵
     * @returns 是否种植成功
     */
    plant(flowerTypeId: number): boolean {
        if (!this.isUnlocked || this.isPlanted) return false;

        const flowerType = getFlowerType(flowerTypeId);
        if (!flowerType) return false;

        this._plantTypeId = flowerTypeId;
        this.isPlanted = true;
        this._growthStage = GrowthStage.Seed;
        this._elapsedGrowTime = 0;
        this._isMature = false;

        const growTimeMs = flowerType.growTime * 1000;
        this._totalGrowTime = growTimeMs;
        this._stageThresholds = [
            growTimeMs * 0.2,
            growTimeMs * 0.5,
            growTimeMs * 1.0,
        ];

        this.updateVisualState();
        this.node.emit('plot-planted', this);
        console.log(`[Plot #${this.plotId}] 种植 ${flowerType.name}`);
        return true;
    }

    /**
     * 每帧更新生长
     * @param deltaTime 秒
     */
    grow(deltaTime: number): void {
        if (!this.isPlanted || this._isMature) return;

        const dtMs = deltaTime * 1000;
        this._elapsedGrowTime += dtMs;

        const prevStage = this._growthStage;
        if (this._elapsedGrowTime >= this._stageThresholds[2]) {
            this._growthStage = GrowthStage.Bloom;
            this._isMature = true;
        } else if (this._elapsedGrowTime >= this._stageThresholds[1]) {
            this._growthStage = GrowthStage.Growing;
        } else if (this._elapsedGrowTime >= this._stageThresholds[0]) {
            this._growthStage = GrowthStage.Sprout;
        }

        if (this._growthStage !== prevStage) {
            this.updateVisualState();
            this.node.emit('plot-growth', this);
            if (this._isMature) {
                this.node.emit('plot-mature', this);
                console.log(`[Plot #${this.plotId}] 成熟可收获`);
            }
        }
    }

    /** 收获已成熟的植物 */
    harvest(): { flowerTypeId: number; value: number } | null {
        if (!this.isPlanted || !this._isMature) return null;

        const data = {
            flowerTypeId: this._plantTypeId!,
            value: getFlowerType(this._plantTypeId!)?.value ?? 0,
        };

        this._plantTypeId = null;
        this.isPlanted = false;
        this._growthStage = GrowthStage.Seed;
        this._elapsedGrowTime = 0;
        this._isMature = false;

        this.updateVisualState();
        this.node.emit('plot-harvested', this);
        return data;
    }

    /** 清除地块内容（用于合成消耗，不给奖励） */
    clear(): void {
        if (!this.isPlanted) return;
        this._plantTypeId = null;
        this.isPlanted = false;
        this._growthStage = GrowthStage.Seed;
        this._elapsedGrowTime = 0;
        this._isMature = false;
        this.updateVisualState();
        this.node.emit('plot-cleared', this);
    }

    // ============ 访问器 ============

    get plantTypeId(): number | null { return this._plantTypeId; }
    get growthStage(): GrowthStage { return this._growthStage; }
    get isMature(): boolean { return this._isMature; }
    get elapsedGrowTime(): number { return this._elapsedGrowTime; }
    get growthProgress(): number {
        return this._totalGrowTime > 0 ? this._elapsedGrowTime / this._totalGrowTime : 0;
    }
    get flowerTypeDef(): FlowerTypeDef | null {
        return this._plantTypeId ? getFlowerType(this._plantTypeId) : null;
    }

    // ============ 内部方法 ============

    protected updateVisualState(): void {
        // 子类可覆写以实现 Sprite 颜色/透明度/缩放变化
        // 阶段变化: Seed->小, Sprout->中, Growing->大, Bloom->盛开
    }

    /** 恢复生长时间（从存档加载时使用） */
    restoreElapsedTime(ms: number): void {
        this._elapsedGrowTime = ms;
        // 重新计算阶段
        if (this._stageThresholds.length > 0) {
            if (this._elapsedGrowTime >= this._stageThresholds[2]) {
                this._growthStage = GrowthStage.Bloom;
                this._isMature = true;
            } else if (this._elapsedGrowTime >= this._stageThresholds[1]) {
                this._growthStage = GrowthStage.Growing;
            } else if (this._elapsedGrowTime >= this._stageThresholds[0]) {
                this._growthStage = GrowthStage.Sprout;
            }
        }
        this.updateVisualState();
    }

    /** 序列化数据 */
    serialize(): object {
        return {
            id: this.plotId,
            unlocked: this.isUnlocked,
            planted: this.isPlanted,
            plantTypeId: this._plantTypeId,
            elapsedGrowTime: this._elapsedGrowTime,
        };
    }

    /** 反序列化 */
    deserialize(data: any): void {
        if (data.unlocked) this.isUnlocked = true;
        if (data.planted && data.plantTypeId != null) {
            this.plant(data.plantTypeId);
            this.restoreElapsedTime(data.elapsedGrowTime ?? 0);
        }
    }
}
