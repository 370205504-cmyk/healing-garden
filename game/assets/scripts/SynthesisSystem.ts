/**
 * SynthesisSystem — 合成系统 Cocos Component
 *
 * Wraps SynthesisLogic 纯逻辑层，管理合成模式状态机
 * 在合成模式下拦截地块 tap 事件，完成 选2→合成 流程
 */

import { _decorator, Component, Node } from 'cc';
import { trySynthesize, canSynthesize, SynthesisResult, getAvailableRecipes, PlotPosition } from './SynthesisLogic';
import { Plot } from './components/Plot';

const { ccclass } = _decorator;

@ccclass('SynthesisSystem')
export class SynthesisSystem extends Component {

    // ============ 系统引用 ============

    private _gameManager: any = null;
    private _plantingSystem: any = null;
    private _economySystem: any = null;
    private _uiManager: any = null;

    // ============ 合成模式状态 ============

    /** 是否处于合成模式 */
    private _isActive: boolean = false;

    /** 当前已选的第一个地块（null=等待选第一个） */
    private _selectedPlot: Plot | null = null;

    /** 合成模式只需 Lv.2 */
    private readonly MIN_LEVEL = 2;

    // ============ 公共接口 ============

    get isActive(): boolean { return this._isActive; }

    /** 进入合成模式 */
    enter(): boolean {
        const gm = this._gameManager;
        if (!gm || gm.level < this.MIN_LEVEL) {
            this._uiManager?.showMessage(`需要 Lv.${this.MIN_LEVEL} 解锁合成`);
            return false;
        }
        this._isActive = true;
        this._selectedPlot = null;
        console.log('[SynthesisSystem] 合成模式 ON');
        if (this._uiManager) this._uiManager.showMessage('点击第一个成熟地块');
        return true;
    }

    /** 退出合成模式 */
    exit(): void {
        this._isActive = false;
        this._selectedPlot = null;
        console.log('[SynthesisSystem] 合成模式 OFF');
        if (this._uiManager) this._uiManager.showMessage('合成模式已关闭');
    }

    /** 切换合成模式开/关 */
    toggle(): boolean {
        if (this._isActive) {
            this.exit();
            return false;
        }
        return this.enter();
    }

    // ============ 地块交互 ============

    /**
     * 合成模式下点击地块
     * 由 PlantingSystem 在合成模式时回调
     */
    onPlotTapped(plot: Plot): void {
        if (!this._isActive) return;

        // 检查地块是否可操作
        if (!plot.isPlanted || !plot.isMature) {
            this._uiManager?.showMessage('请选择已成熟的地块');
            return;
        }

        if (this._selectedPlot === null) {
            // 第一次选择
            this._selectedPlot = plot;
            this._uiManager?.showMessage('再点击另一个同类成熟地块');
            // 高亮可选地块
            this.highlightCandidates(plot);
            return;
        }

        // 不能选同一个地块
        if (this._selectedPlot === plot) {
            this._uiManager?.showMessage('请选择另一个地块');
            return;
        }

        // 执行合成
        this.executeSynthesis(this._selectedPlot, plot);
        this._selectedPlot = null;
    }

    // ============ 合成执行 ============

    private executeSynthesis(plotA: Plot, plotB: Plot): void {
        const gm = this._gameManager;
        if (!gm) return;

        const positions: PlotPosition[] = [
            { plotId: plotA.plotId, row: plotA.row, col: plotA.col },
            { plotId: plotB.plotId, row: plotB.row, col: plotB.col },
        ];

        const request = {
            sourceIds: [plotA.plotId, plotB.plotId],
            targetPlotId: plotA.plotId,
            gameLevel: gm.level,
        };

        const check = canSynthesize(request, positions);
        if (!check.canDo) {
            this._uiManager?.showMessage(check.reason ?? '无法合成');
            this.exit();
            return;
        }

        // 使用 A 地块作为目标位置
        const result = trySynthesize(
            [
                { flowerTypeId: plotA.plantTypeId!, isMature: true },
                { flowerTypeId: plotB.plantTypeId!, isMature: true },
            ],
            positions,
            gm.level,
        );

        if (!result.success) {
            this._uiManager?.showMessage(result.reason ?? '合成失败');
            this.exit();
            return;
        }

        this.applyResult(result, plotA, plotB);

        if (this._uiManager) {
            this._uiManager.showMessage('✨ 合成成功！');
            this._uiManager.onCoinsUpdated(gm.coins);
            this._uiManager.onLevelUp(gm.level);
        }

        this.exit();
    }

    /** 应用合成结果：消耗源地块、创建新植物、给奖励 */
    private applyResult(result: SynthesisResult, target: Plot, consumed: Plot): void {
        const gm = this._gameManager;
        if (!gm || !result.resultTypeId) return;

        // 1. 消耗被合成的地块
        consumed.clear();
        this._plantingSystem?.savePlotData();

        // 2. 目标地块重新种合成结果
        //    （通过 plantingSystem 种的植物会自动保存）
        if (this._plantingSystem) {
            this._plantingSystem.plantAt(target.plotId, result.resultTypeId);
        }

        // 3. 金币 + 经验奖励
        if (result.coinReward) gm.addCoins(result.coinReward);
        if (result.expReward) gm.addExperience(result.expReward);

        console.log(`[SynthesisSystem] 合成完成: ${result.resultTypeId}, +${result.coinReward}金币, +${result.expReward}经验`);
    }

    /** 高亮可选的合成伙伴（功能留空，UI 实现） */
    private highlightCandidates(_selected: Plot): void {
        // TODO: 在 UI 层高亮所有与 selected 同类型的地块
    }

    // ============ 查询 ============

    /** 当前等级可合成什么 */
    getRecipes(level: number): ReturnType<typeof getAvailableRecipes> {
        return getAvailableRecipes(level);
    }

    // ============ DI ============

    setGameManager(gm: any): void { this._gameManager = gm; }
    setPlantingSystem(ps: any): void { this._plantingSystem = ps; }
    setEconomySystem(eco: any): void { this._economySystem = eco; }
    setUIManager(ui: any): void { this._uiManager = ui; }
}
