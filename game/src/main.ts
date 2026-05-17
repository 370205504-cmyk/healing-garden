// 入口 — 浏览器环境

import { GameManager } from './GameManager'
import { createStorage, IStorage } from './core/Storage'
import { createWebAdapter } from './platform/PlatformAdapter'

function main(): void {
  const storage: IStorage = createStorage()
  const platform = createWebAdapter()
  const game = new GameManager(storage, platform)

  game.loadGame()
  game.startTick()

  console.log('[Healing Garden] Game initialized:', {
    coins: game.getCoins(),
    level: game.getLevel(),
    platform: platform.name,
  })
}

if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', main)
} else {
  main()
}
