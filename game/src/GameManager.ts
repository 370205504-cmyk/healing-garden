// 纯 TS 游戏管理器 — 已集成 PlayerStateManager + GardenLayout
// 纯逻辑层，零引擎依赖

import { EventBus } from './core/EventBus'
import { IStorage } from './core/Storage'
import { PlantManager } from './managers/PlantManager'
import { MeditationManager } from './managers/MeditationManager'
import { UIManager } from './managers/UIManager'
import { PlatformAdapter } from './platform/PlatformAdapter'
import { FLOWER_TYPES, getFlowerType } from './FlowerConfig'
import { PlayerStateManager, PlayerSaveData, createDefaultSave } from './data/PlayerState'
import { calculateGardenLayout, GardenLayout } from './data/GardenLayout'

export { PlayerStateManager } from './data/PlayerState'
export { GardenLayout } from './data/GardenLayout'
export { PLOT_GRID, COLORS, BOTTOM_BUTTONS, TOP_BUTTONS } from './data/GameConfig'

export class GameManager {
  private eventBus: EventBus
  private storage: IStorage
  private platform: PlatformAdapter
  private plantManager: PlantManager
  private meditationManager: MeditationManager
  private uiManager: UIManager
  private playerState: PlayerStateManager
  private gardenLayout: GardenLayout
  private startTime: number
  private tickInterval: number | null = null

  constructor(storage: IStorage, platform: PlatformAdapter) {
    this.eventBus = EventBus.getInstance()
    this.storage = storage
    this.platform = platform
    this.plantManager = new PlantManager(this.eventBus)
    this.meditationManager = new MeditationManager(this.eventBus)
    this.uiManager = new UIManager(this.eventBus)
    this.playerState = new PlayerStateManager()
    this.gardenLayout = calculateGardenLayout()
    this.startTime = Date.now()

    // 注册持久化回调
    this.playerState.setSaveHandler((data) => this.persistSave(data))
    this.setupEventListeners()
  }

  private setupEventListeners(): void {
    this.eventBus.on('plant:harvested', (data: { plotIndex: number; reward: number }) => {
      this.playerState.addCoins(data.reward)
      this.playerState.addExp(Math.floor(data.reward / 2))
      this.playerState.save()
    })

    this.eventBus.on('plant:ready', (data: { plotIndex: number }) => {
      this.uiManager.showToast('一朵花已经开放了！')
    })

    this.eventBus.on('meditation:completed', (session: { coinsEarned: number }) => {
      this.playerState.addCoins(session.coinsEarned)
      this.playerState.addExp(Math.floor(session.coinsEarned / 2))
      this.playerState.save()
    })
  }

  // ── 公共访问器 ──

  getEventBus(): EventBus { return this.eventBus }
  getPlantManager(): PlantManager { return this.plantManager }
  getMeditationManager(): MeditationManager { return this.meditationManager }
  getUIManager(): UIManager { return this.uiManager }
  getPlatform(): PlatformAdapter { return this.platform }
  getPlayerState(): PlayerStateManager { return this.playerState }
  getGardenLayout(): GardenLayout { return this.gardenLayout }

  getCoins(): number { return this.playerState.coins }
  getLevel(): number { return this.playerState.level }
  getExperience(): number { return this.playerState.exp }
  getExpToNextLevel(): number { return this.playerState.expToNextLevel }

  // ── 游戏状态管理 ──

  loadGame(): void {
    // 加载玩家状态
    const saved = this.storage.get<PlayerSaveData>('playerState')
    if (saved) {
      this.playerState.load(saved)
    }

    // 同步 PlantManager（已有 PlantManager 的序列化路径）
    const plants = this.storage.get<Record<string, any>>('plants')
    if (plants) {
      this.plantManager.deserialize(plants as any)
    }

    // 加载冥想数据
    const meditation = this.storage.get<Record<string, any>>('meditation')
    if (meditation) {
      this.meditationManager.deserialize(meditation as any)
    }

    // 处理离线进度
    this.processOfflineProgress()
  }

  saveState(): void {
    this.playerState.save()
    this.storage.set('plants', this.plantManager.serialize())
    this.storage.set('meditation', this.meditationManager.serialize())
  }

  private persistSave(data: PlayerSaveData): void {
    this.storage.set('playerState', data)
  }

  private processOfflineProgress(): void {
    const now = Date.now()
    this.plantManager.tickAll(now)
    this.eventBus.emit('game:offlineProgress', {
      elapsed: now - this.playerState['data'].lastUpdateTime,
    })
  }

  // ── 游戏循环 ──

  startTick(intervalMs = 1000): void {
    this.tickInterval = window.setInterval(() => {
      const now = Date.now()
      this.plantManager.tickAll(now)
      this.meditationManager.update(now)
    }, intervalMs)
  }

  stopTick(): void {
    if (this.tickInterval != null) {
      clearInterval(this.tickInterval)
      this.tickInterval = null
    }
  }

  // ── 游戏操作代理 ──

  /** 在指定地块播种 */
  plant(plotIndex: number, flowerType: string): boolean {
    const type = getFlowerType(flowerType)
    if (!type) return false

    // 检查金币
    if (!this.playerState.spendCoins(type.price)) {
      this.uiManager.showToast(`金币不足！需要 ${type.price} 金币`)
      return false
    }

    // 检查等级
    if (this.playerState.level < type.unlockLevel) {
      this.uiManager.showToast(`需要 ${type.unlockLevel} 级解锁`)
      return false
    }

    return this.plantManager.plant(plotIndex, flowerType, Date.now())
  }

  /** 收获指定地块 */
  harvest(plotIndex: number): number {
    return this.plantManager.harvest(plotIndex)
  }

  /** 一键收获所有成熟花卉 */
  harvestAll(): number {
    let totalCoins = 0
    let count = 0
    const slots = this.plantManager.getAllSlots(this.playerState.unlockedPlots)
    for (const slot of slots) {
      if (!slot.isEmpty && slot.plant?.state === 'ready') {
        totalCoins += this.plantManager.harvest(slot.index)
        count++
      }
    }
    if (count > 0) {
      this.playerState.addCoins(totalCoins)
      this.saveState()
      this.uiManager.showToast(`收获 ${count} 朵花，获得 ${totalCoins} 金币！`)
    } else {
      this.uiManager.showToast('没有可收获的花卉')
    }
    return totalCoins
  }
}
