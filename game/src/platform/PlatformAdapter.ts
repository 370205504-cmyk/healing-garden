// 统一平台适配接口 — 纯逻辑层，零引擎依赖

export interface PlatformAdapter {
  readonly name: string
  readonly isMiniProgram: boolean

  getStorage<T>(key: string): T | null
  setStorage<T>(key: string, value: T): void
  removeStorage(key: string): void
  clearStorage(): void

  getSystemInfo(): SystemInfo
  share(options: ShareOptions): void
  vibrate(type: 'light' | 'medium' | 'heavy'): void
  showToast(message: string): void
  showModal(title: string, message: string): Promise<boolean>
}

export interface SystemInfo {
  platform: string
  screenWidth: number
  screenHeight: number
  pixelRatio: number
  language: string
  version: string
  isDevTools: boolean
}

export interface ShareOptions {
  title: string
  imageUrl?: string
  query?: string
}

export function createWebAdapter(): PlatformAdapter {
  return {
    name: 'web',
    isMiniProgram: false,
    getStorage: <T>(key: string): T | null => {
      const raw = localStorage.getItem(key)
      if (raw == null) return null
      try { return JSON.parse(raw) as T } catch { return raw as T }
    },
    setStorage: <T>(key: string, value: T): void => {
      localStorage.setItem(key, JSON.stringify(value))
    },
    removeStorage: (key: string): void => localStorage.removeItem(key),
    clearStorage: (): void => localStorage.clear(),
    getSystemInfo: (): SystemInfo => ({
      platform: 'web',
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      pixelRatio: window.devicePixelRatio || 1,
      language: navigator.language,
      version: '1.0',
      isDevTools: false,
    }),
    share: (_options: ShareOptions): void => {
      if (navigator.share) {
        navigator.share({ title: _options.title }).catch(() => {})
      }
    },
    vibrate: (type: 'light' | 'medium' | 'heavy'): void => {
      if (navigator.vibrate) {
        const duration = type === 'light' ? 10 : type === 'medium' ? 25 : 50
        navigator.vibrate(duration)
      }
    },
    showToast: (message: string): void => {
      alert(message)
    },
    showModal: async (title: string, message: string): Promise<boolean> => {
      return confirm(`${title}\n${message}`)
    },
  }
}
