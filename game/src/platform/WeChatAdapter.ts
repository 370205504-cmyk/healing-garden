// 微信小程序适配 — 纯逻辑层，零引擎依赖
/// <reference path="PlatformAdapter.ts" />

import { PlatformAdapter, SystemInfo, ShareOptions } from './PlatformAdapter'

declare const wx: any

export class WeChatAdapter implements PlatformAdapter {
  readonly name = 'wechat'
  readonly isMiniProgram = true

  getStorage<T>(key: string): T | null {
    const raw = wx.getStorageSync(key)
    if (raw == null || raw === '') return null
    try { return JSON.parse(raw) as T } catch { return raw as T }
  }

  setStorage<T>(key: string, value: T): void {
    wx.setStorageSync(key, JSON.stringify(value))
  }

  removeStorage(key: string): void {
    wx.removeStorageSync(key)
  }

  clearStorage(): void {
    wx.clearStorageSync()
  }

  getSystemInfo(): SystemInfo {
    const info = wx.getSystemInfoSync()
    return {
      platform: info.platform || 'wechat',
      screenWidth: info.screenWidth,
      screenHeight: info.screenHeight,
      pixelRatio: info.pixelRatio,
      language: info.language,
      version: info.version || '1.0',
      isDevTools: info.platform === 'devtools',
    }
  }

  share(options: ShareOptions): void {
    wx.shareAppMessage({
      title: options.title,
      imageUrl: options.imageUrl,
      query: options.query,
    })
  }

  vibrate(type: 'light' | 'medium' | 'heavy'): void {
    if (type === 'heavy') {
      wx.vibrateLong({})
    } else {
      wx.vibrateShort({ type })
    }
  }

  showToast(message: string): void {
    wx.showToast({ title: message, icon: 'none', duration: 1500 })
  }

  showModal(title: string, message: string): Promise<boolean> {
    return new Promise(resolve => {
      wx.showModal({
        title,
        content: message,
        success: (res: any) => resolve(res.confirm),
      })
    })
  }
}
