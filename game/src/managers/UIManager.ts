// UI 管理器 — 纯逻辑层，零引擎依赖

import { EventBus } from '../core/EventBus'

export type Screen = 'garden' | 'shop' | 'meditation' | 'inventory' | 'settings'

export interface UIManagerState {
  currentScreen: Screen
  overlay: boolean
  showConfirm: boolean
  confirmText: string
}

export class UIManager {
  private eventBus: EventBus
  private currentScreen: Screen = 'garden'
  private overlay = false

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus
  }

  navigateTo(screen: Screen): void {
    this.currentScreen = screen
    this.eventBus.emit('ui:navigate', { screen })
  }

  getCurrentScreen(): Screen {
    return this.currentScreen
  }

  showOverlay(): void {
    this.overlay = true
    this.eventBus.emit('ui:overlay', { visible: true })
  }

  hideOverlay(): void {
    this.overlay = false
    this.eventBus.emit('ui:overlay', { visible: false })
  }

  isOverlayVisible(): boolean {
    return this.overlay
  }

  showToast(message: string): void {
    this.eventBus.emit('ui:toast', { message, duration: 2000 })
  }

  showConfirm(title: string, message: string): void {
    this.eventBus.emit('ui:confirm', { title, message })
  }

  getState(): UIManagerState {
    return {
      currentScreen: this.currentScreen,
      overlay: this.overlay,
      showConfirm: false,
      confirmText: '',
    }
  }
}
