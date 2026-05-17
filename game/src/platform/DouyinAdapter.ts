// 抖音小程序适配 — 纯逻辑层，零引擎依赖

import { PlatformAdapter, SystemInfo, ShareOptions } from './PlatformAdapter'

declare const tt: any

export class DouyinAdapter implements PlatformAdapter {
  readonly name = 'douyin'
  readonly isMiniProgram = true

  getStorage<T>(key: string): T | null {
    const raw = tt.getStorageSync(key)
    if (raw == null || raw === '') return null
    try { return JSON.parse(raw) as T } catch { return raw as T }
  }

  setStorage<T>(key: string, value: T): void {
    tt.setStorageSync(key, JSON.stringify(value))
  }

  removeStorage(key: string): void {
    tt.removeStorageSync(key)
  }

  clearStorage(): void {
    tt.clearStorageSync()
  }

  getSystemInfo(): SystemInfo {
    const info = tt.getSystemInfoSync()
    return {
      platform: info.platform || 'douyin',
      screenWidth: info.screenWidth,
      screenHeight: info.screenHeight,
      pixelRatio: info.pixelRatio,
      language: info.language || 'zh_CN',
      version: info.version || '1.0',
      isDevTools: info.platform === 'devtools',
    }
  }

  share(options: ShareOptions): void {
    tt.shareAppMessage({
      title: options.title,
      imageUrl: options.imageUrl,
      query: options.query,
    })
  }

  vibrate(type: 'light' | 'medium' | 'heavy'): void {
    if (type === 'heavy') {
      tt.vibrateLong({})
    } else {
      tt.vibrateShort({ type })
    }
  }

  showToast(message: string): void {
    tt.showToast({ title: message, icon: 'none', duration: 1500 })
  }

  showModal(title: string, message: string): Promise<boolean> {
    return new Promise(resolve => {
      tt.showModal({
        title,
        content: message,
        success: (res: any) => resolve(res.confirm),
      })
    })
  }
}
