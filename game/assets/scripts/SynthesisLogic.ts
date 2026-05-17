/**
 * SynthesisLogic — 纯合成规则引擎
 *
 * 移植自 Canvas 2D 版本（src/game.js + src/synthesis/）
 * 零 Cocos 引擎依赖，纯数据驱动
 *
 * 合成规则：
 * - 同类型 x2 成熟花朵 → 下一级（level+1, value*1.5）
 * - 曼哈顿距离 ≤ 2
 * - Lv2 解锁合成模式
 */

import { getFlowerType, FlowerTypeDef } from './data/FlowerTypes';

// ============ 类型定义 ============

export interface PlantData {
    flowerTypeId: number;
    /** 是否已成熟可收获 */
    isMature: boolean;
    /** 已序列化的额外属性 */
    [key: string]: any;
}

export interface PlotPosition {
    plotId: number;
    row: number;
    col: number;
}

/** 合成配方 */
export interface SynthesisRecipe {
    /** 需要什么类型（按 id） */
    sourceTypeId: number;
    /** 需要几份 */
    count: number;
    /** 产出的类型 */
    resultTypeId: number;
    /** 最小等级要求 */
    minLevel: number;
}

/** 合成请求 */
export interface SynthesisRequest {
    sourceIds: number[];
    targetPlotId: number;
    gameLevel: number;
}

/** 合成结果 */
export interface SynthesisResult {
    success: boolean;
    reason?: string;
    /** 生成的新植物类型 */
    resultTypeId?: number;
    /** 金币奖励 */
    coinReward?: number;
    /** 经验奖励 */
    expReward?: number;
}

// ============ 合成配方 ============

const SYNTHESIS_RECIPES: SynthesisRecipe[] = [
    { sourceTypeId: 1, count: 3, resultTypeId: 3, minLevel: 2 },     // 3×三叶草 → 向日葵
    { sourceTypeId: 2, count: 3, resultTypeId: 4, minLevel: 3 },     // 3×蒲公英 → 玫瑰
    { sourceTypeId: 1, count: 2, resultTypeId: 5, minLevel: 3 },     // 2×三叶草 → 薰衣草
    { sourceTypeId: 3, count: 2, resultTypeId: 6, minLevel: 4 },     // 2×向日葵 → 仙人掌
    { sourceTypeId: 4, count: 2, resultTypeId: 7, minLevel: 6 },     // 2×玫瑰 → 蓝色妖姬
    { sourceTypeId: 6, count: 2, resultTypeId: 8, minLevel: 8 },     // 2×仙人掌 → 彩虹花
];

// ============ 核心函数 ============

/** 曼哈顿距离计算 */
function manhattanDistance(a: PlotPosition, b: PlotPosition): number {
    return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

/**
 * 检查是否能合成
 */
export function canSynthesize(request: SynthesisRequest, positions: PlotPosition[]): { canDo: boolean; recipe?: SynthesisRecipe; reason?: string } {
    const { sourceIds, gameLevel } = request;

    // 检查等级
    if (gameLevel < 2) {
        return { canDo: false, reason: '需要Lv.2解锁合成' };
    }

    // 需要恰好2个源
    if (sourceIds.length !== 2) {
        return { canDo: false, reason: '合成需要选择2个地块' };
    }

    const p1Id = sourceIds[0];
    const p2Id = sourceIds[1];
    const pos1 = positions.find(p => p.plotId === p1Id);
    const pos2 = positions.find(p => p.plotId === p2Id);

    if (!pos1 || !pos2) {
        return { canDo: false, reason: '地块索引无效' };
    }

    // 距离检查：曼哈顿距离 ≤ 2
    const dist = manhattanDistance(pos1, pos2);
    if (dist > 2) {
        return { canDo: false, reason: `距离过远 (${dist})，最大2格` };
    }

    // 查找匹配的配方
    for (const recipe of SYNTHESIS_RECIPES) {
        if (gameLevel < recipe.minLevel) continue;
        // 配方检查由外部传入的 PlantData 中的 isMature 和 flowerTypeId 完成
        return { canDo: true, recipe };
    }

    return { canDo: false, reason: '没有匹配的合成配方' };
}

/**
 * 尝试合成（纯逻辑，无副作用）
 * @param plants 参与合成的植物数据
 * @param gameLevel 当前玩家等级
 */
export function trySynthesize(
    sourcePlants: PlantData[],
    positions: PlotPosition[],
    gameLevel: number,
): SynthesisResult {
    if (sourcePlants.length !== 2) {
        return { success: false, reason: '需要2个植物进行合成' };
    }

    const plantA = sourcePlants[0];
    const plantB = sourcePlants[1];

    // 检查成熟度
    if (!plantA.isMature || !plantB.isMature) {
        return { success: false, reason: '植物未成熟' };
    }

    // 检查类型匹配（目前规则：需要同类型）
    if (plantA.flowerTypeId !== plantB.flowerTypeId) {
        return { success: false, reason: '需要同类型植物' };
    }

    const typeA = getFlowerType(plantA.flowerTypeId);
    if (!typeA) {
        return { success: false, reason: '未知植物类型' };
    }

    // 查找配方
    const recipe = SYNTHESIS_RECIPES.find(
        r => r.sourceTypeId === plantA.flowerTypeId
            && r.minLevel <= gameLevel,
    );

    if (!recipe) {
        return { success: false, reason: '该植物无法合成更高级' };
    }

    const resultType = getFlowerType(recipe.resultTypeId);
    if (!resultType) {
        return { success: false, reason: '合成结果未知' };
    }

    // 合成成功
    const coinReward = Math.floor((typeA.value + resultType.value) * 0.8);
    const expReward = Math.ceil(coinReward * 0.5);

    return {
        success: true,
        resultTypeId: recipe.resultTypeId,
        coinReward,
        expReward,
    };
}

/** 获取当前等级可用的合成配方 */
export function getAvailableRecipes(level: number): SynthesisRecipe[] {
    return SYNTHESIS_RECIPES.filter(r => r.minLevel <= level);
}

/** 获取花朵能否作为合成原料（至少有一个配方的 sourceTypeId 匹配） */
export function canBeSource(flowerTypeId: number): boolean {
    return SYNTHESIS_RECIPES.some(r => r.sourceTypeId === flowerTypeId);
}
