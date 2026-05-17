// Web 平台适配 — 纯逻辑层，零引擎依赖

import { PlatformAdapter, SystemInfo, ShareOptions, createWebAdapter } from './PlatformAdapter'

export class WebAdapter implements PlatformAdapter {
  readonly name = 'web'
  readonly isMiniProgram = false
  private base: PlatformAdapter

  constructor() {
    this.base = createWebAdapter()
  }

  getStorage<T>(key: string): T | null {
    return this.base.getStorage<T>(key)
  }

  setStorage<T>(key: string, value: T): void {
    this.base.setStorage(key, value)
  }

  removeStorage(key: string): void {
    this.base.removeStorage(key)
  }

  clearStorage(): void {
    this.base.clearStorage()
  }

  getSystemInfo(): SystemInfo {
    return this.base.getSystemInfo()
  }

  share(options: ShareOptions): void {
    this.base.share(options)
  }

  vibrate(type: 'light' | 'medium' | 'heavy'): void {
    this.base.vibrate(type)
  }

  showToast(message: string): void {
    this.base.showToast(message)
  }

  showModal(title: string, message: string): Promise<boolean> {
    return this.base.showModal(title, message)
  }
}
