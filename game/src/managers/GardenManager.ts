// 花园交互管理器 — 从 game.js handlePlotClick 等逻辑移植
// 桥接 PlantManager + PlayerStateManager + UI
// 纯逻辑层

import { EventBus } from '../core/EventBus'
import { PlantManager } from './PlantManager'
import { UIManager } from './UIManager'
import { PlayerStateManager } from '../data/PlayerState'
import { getFlowerType } from '../FlowerConfig'
import { PLOT_GRID, getRequiredLevelForPlot } from '../data/GameConfig'
import {
  SynthesisState,
  createSynthesisState,
  canSynthesize,
  calculateSynthesisReward,
} from '../data/SynthesisData'
import { createHighlightState, HighlightState } from '../data/EffectData'

/** 地块点击结果 */
export interface PlotActionResult {
  action: 'planted' | 'harvested' | 'cleaned' | 'locked' | 'growing' | 'need_seeds' | 'none'
  message: string
  reward?: number
}

/** 一键操作结果 */
export interface BatchActionResult {
  count: number
  totalReward: number
}

export class GardenManager {
  private eventBus: EventBus
  private plantManager: PlantManager
  private uiManager: UIManager
  private playerState: PlayerStateManager

  // 合成模式状态
  private synthesis: SynthesisState
  // 高亮状态
  private highlight: HighlightState

  constructor(
    eventBus: EventBus,
    plantManager: PlantManager,
    uiManager: UIManager,
    playerState: PlayerStateManager,
  ) {
    this.eventBus = eventBus
    this.plantManager = plantManager
    this.uiManager = uiManager
    this.playerState = playerState
    this.synthesis = createSynthesisState()
    this.highlight = createHighlightState()
  }

  /** 更新动画相位 */
  updateAnimation(now: number): void {
    this.highlight.pulsePhase += this.highlight.pulseSpeed
    if (this.highlight.pulsePhase > Math.PI * 2) {
      this.highlight.pulsePhase = 0
    }
  }

  // ── 地块交互 ──

  /** 处理地块点击 */
  handlePlotClick(plotIndex: number): PlotActionResult {
    const plot = this.playerState.getPlotRuntime(plotIndex)

    // 合成模式优先
    if (this.synthesis.active) {
      return this.handleSynthesisPlotClick(plotIndex)
    }

    // 锁定地块
    if (!plot.isUnlocked) {
      const reqLevel = getRequiredLevelForPlot(plotIndex)
      return {
        action: 'locked',
        message: `需要等级 ${reqLevel} 解锁`,
      }
    }

    switch (plot.state) {
      case 'empty':
        return { action: 'need_seeds', message: '请选择种子' }
      case 'growing':
        return this.handleGrowing(plotIndex)
      case 'ready':
        return this.handleHarvest(plotIndex)
      case 'withered':
        return this.handleClean(plotIndex)
      default:
        return { action: 'none', message: '' }
    }
  }

  /** 种植（需从外部传入种子类型） */
  plantFlower(plotIndex: number, flowerTypeId: string): boolean {
    const type = getFlowerType(flowerTypeId)
    if (!type) return false

    // 检查等级
    if (this.playerState.level < type.unlockLevel) {
      this.uiManager.showToast(`需要 ${type.unlockLevel} 级解锁`)
      return false
    }

    // 检查金币
    if (!this.playerState.spendCoins(type.price)) {
      this.uiManager.showToast(`金币不足！需要 ${type.price} 金币`)
      return false
    }

    const success = this.plantManager.plant(plotIndex, flowerTypeId, Date.now())
    if (success) {
      this.eventBus.emit('garden:planted', { plotIndex, flowerTypeId })
      this.playerState.save()
    }
    return success
  }

  // ── 合成模式 ──

  toggleSynthesisMode(): boolean {
    if (this.playerState.level < 2) {
      this.uiManager.showToast('需要达到2级才能使用合成功能！')
      return false
    }

    this.synthesis.active = !this.synthesis.active
    this.synthesis.selectedPlotIndex = null
    this.synthesis.comboStreak = 0
    this.synthesis.comboMultiplier = 1.0
    this.highlight.plotIndex = -1

    if (this.synthesis.active) {
      this.uiManager.showToast('合成模式已开启！请选择一个植物')
    } else {
      this.uiManager.showToast('合成模式已关闭')
    }

    this.eventBus.emit('garden:synthesisToggled', { active: this.synthesis.active })
    return this.synthesis.active
  }

  isSynthesisActive(): boolean {
    return this.synthesis.active
  }

  getHighlightState(): HighlightState {
    return { ...this.highlight }
  }

  getSynthesisState(): SynthesisState {
    return { ...this.synthesis }
  }

  private handleSynthesisPlotClick(plotIndex: number): PlotActionResult {
    const plant = this.plantManager.getPlant(plotIndex)

    if (this.synthesis.selectedPlotIndex === null) {
      // 第一次选择
      if (!plant) {
        return { action: 'none', message: '该地块没有植物' }
      }
      this.synthesis.selectedPlotIndex = plotIndex
      this.highlight.plotIndex = plotIndex
      this.highlight.pulsePhase = 0
      this.uiManager.showToast('已选择，请选择第二个植物')
      return { action: 'none', message: '已选择第一个植物' }
    }

    // 第二次选择 — 尝试合成
    const firstPlant = this.plantManager.getPlant(this.synthesis.selectedPlotIndex)
    const result = canSynthesize(firstPlant, plant, this.synthesis.selectedPlotIndex, plotIndex)

    if (!result.can) {
      const failMessages: Record<string, string> = {
        same_plot: '不能选择同一地块',
        no_plant: '植物不存在',
        type_mismatch: '必须选择相同类型的花',
        not_ready: '植物还未成熟',
        too_far: '距离太远，请选择相邻的花',
      }
      this.uiManager.showToast(failMessages[result.reason] ?? '合成失败')
      this.synthesis.selectedPlotIndex = null
      this.highlight.plotIndex = -1
      return { action: 'none', message: failMessages[result.reason] ?? '合成失败' }
    }

    // 执行合成
    const reward = calculateSynthesisReward(result.result.coinReward, this.synthesis.comboMultiplier)

    // 移除两个旧植物，在第一个位置种新植物
    this.plantManager.harvest(this.synthesis.selectedPlotIndex)
    this.plantManager.harvest(plotIndex)
    // 在第一个位置种上合成后的高级花
    this.plantManager.plant(this.synthesis.selectedPlotIndex, result.result.resultType, Date.now())

    this.playerState.addCoins(reward)
    this.playerState.addExp(Math.floor(reward / 2))
    this.playerState.save()

    // 连击
    this.synthesis.comboStreak++
    this.synthesis.comboMultiplier = 1.0 + (this.synthesis.comboStreak - 1) * 0.1

    // 重置选择状态
    this.synthesis.selectedPlotIndex = null
    this.highlight.plotIndex = -1

    this.eventBus.emit('garden:synthesisSuccess', {
      sourceIndex: plotIndex,
      targetIndex: this.synthesis.selectedPlotIndex,
      resultType: result.result.resultType,
      reward,
    })

    this.uiManager.showToast(`合成成功 +${reward} 金币！`)
    if (this.synthesis.comboStreak > 1) {
      this.uiManager.showToast(`连击 x${this.synthesis.comboMultiplier.toFixed(1)}！`)
    }

    return { action: 'planted', message: `合成成功！`, reward }
  }

  // ── 内部方法 ──

  private handleGrowing(plotIndex: number): PlotActionResult {
    const plant = this.plantManager.getPlant(plotIndex)
    if (!plant) return { action: 'none', message: '' }

    const type = getFlowerType(plant.type)
    if (!type) return { action: 'none', message: '' }

    const remaining = Math.ceil((plant.growthDuration * (1 - plant.progress)) / 60000)
    return {
      action: 'growing',
      message: `${type.name} 正在生长，${remaining}分钟后开花`,
    }
  }

  private handleHarvest(plotIndex: number): PlotActionResult {
    const reward = this.plantManager.harvest(plotIndex)
    if (reward <= 0) return { action: 'none', message: '' }

    this.playerState.addCoins(reward)
    const leveled = this.playerState.addExp(Math.floor(reward / 2))
    this.playerState.save()

    if (leveled) {
      this.uiManager.showToast(`升级到 ${this.playerState.level} 级！解锁了新花田！`)
    }

    return {
      action: 'harvested',
      message: `收获，获得 ${reward} 金币！`,
      reward,
    }
  }

  private handleClean(plotIndex: number): PlotActionResult {
    this.plantManager.harvest(plotIndex) // harvest on withered returns 0
    return { action: 'cleaned', message: '花田已清理干净！' }
  }

  // ── 批量操作 ──

  /** 一键收获所有成熟花卉 */
  harvestAll(): BatchActionResult {
    let count = 0
    let totalReward = 0
    const slots = this.plantManager.getAllSlots(this.playerState.unlockedPlots)

    for (const slot of slots) {
      if (slot.plant?.state === 'ready') {
        const reward = this.plantManager.harvest(slot.index)
        totalReward += reward
        count++
      }
    }

    if (count > 0) {
      this.playerState.addCoins(totalReward)
      this.playerState.save()
      this.uiManager.showToast(`一键收获 ${count} 朵花，获得 ${totalReward} 金币！`)
    } else {
      this.uiManager.showToast('没有可收获的花卉')
    }

    return { count, totalReward }
  }

  /** 一键清理所有枯萎花卉 */
  cleanAll(): BatchActionResult {
    let count = 0
    const slots = this.plantManager.getAllSlots(this.playerState.unlockedPlots)

    for (const slot of slots) {
      if (slot.plant?.state === 'withered') {
        this.plantManager.harvest(slot.index)
        count++
      }
    }

    if (count > 0) {
      this.uiManager.showToast(`一键清理 ${count} 块花田！`)
    } else {
      this.uiManager.showToast('没有可清理的花田')
    }

    return { count, totalReward: 0 }
  }
}
