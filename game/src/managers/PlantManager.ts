// 种植管理器 — 纯逻辑层，零引擎依赖

import { EventBus } from '../core/EventBus'
import { FLOWER_TYPES, FlowerData, getFlowerType } from '../FlowerConfig'

export interface PlantSlot {
  index: number
  plant: FlowerData | null
  isEmpty: boolean
}

export class PlantManager {
  private plants: Map<number, FlowerData> = new Map()
  private eventBus: EventBus

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus
  }

  plant(plotIndex: number, flowerType: string, now: number): boolean {
    if (this.plants.has(plotIndex)) return false
    const type = getFlowerType(flowerType)
    if (!type) return false

    const data: FlowerData = {
      type: flowerType,
      growthStartTime: now,
      growthDuration: type.growthTime,
      progress: 0,
      state: 'growing',
      plantedPlot: plotIndex,
    }

    this.plants.set(plotIndex, data)
    this.eventBus.emit('plant:planted', { plotIndex, data })
    return true
  }

  water(plotIndex: number, now: number): boolean {
    const plant = this.plants.get(plotIndex)
    if (!plant || plant.state !== 'growing') return false
    // 浇水加速 20%
    plant.growthDuration = plant.growthDuration * 0.8
    this.eventBus.emit('plant:watered', { plotIndex })
    return true
  }

  harvest(plotIndex: number): number {
    const plant = this.plants.get(plotIndex)
    if (!plant || plant.state !== 'ready') return 0

    const type = getFlowerType(plant.type)
    if (!type) return 0

    this.plants.delete(plotIndex)
    this.eventBus.emit('plant:harvested', { plotIndex, reward: type.reward })
    return type.reward
  }

  tickAll(now: number): void {
    this.plants.forEach((plant, index) => {
      if (plant.state !== 'growing') return
      const elapsed = now - plant.growthStartTime
      plant.progress = Math.min(1, elapsed / plant.growthDuration)
      if (plant.progress >= 1) {
        plant.state = 'ready'
        plant.progress = 1
        this.eventBus.emit('plant:ready', { plotIndex: index, data: plant })
      }
    })
  }

  getPlant(plotIndex: number): FlowerData | null {
    return this.plants.get(plotIndex) ?? null
  }

  getAllSlots(plotCount: number): PlantSlot[] {
    const slots: PlantSlot[] = []
    for (let i = 0; i < plotCount; i++) {
      slots.push({
        index: i,
        plant: this.plants.get(i) ?? null,
        isEmpty: !this.plants.has(i),
      })
    }
    return slots
  }

  getGrowingCount(): number {
    let count = 0
    this.plants.forEach(p => { if (p.state === 'growing') count++ })
    return count
  }

  getReadyCount(): number {
    let count = 0
    this.plants.forEach(p => { if (p.state === 'ready') count++ })
    return count
  }

  serialize(): Record<string, FlowerData> {
    const data: Record<string, FlowerData> = {}
    this.plants.forEach((plant, index) => {
      data[String(index)] = plant
    })
    return data
  }

  deserialize(data: Record<string, FlowerData>): void {
    this.plants.clear()
    Object.entries(data).forEach(([key, value]) => {
      this.plants.set(Number(key), value)
    })
  }
}
