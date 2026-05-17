// 跨环境存储抽象 — 纯逻辑层，零引擎依赖

export interface IStorage {
  set<T>(key: string, data: T): void
  get<T>(key: string, defaultValue?: T | null): T | null
  remove(key: string): void
  clear(): void
}

// 检测平台可用性
function hasWx(): boolean {
  return typeof wx !== 'undefined' && wx !== null
}

function hasTt(): boolean {
  return typeof tt !== 'undefined' && tt !== null
}

export class WebStorage implements IStorage {
  set<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data))
    } catch {
      console.warn(`[Storage] set failed: ${key}`)
    }
  }

  get<T>(key: string, defaultValue: T | null = null): T | null {
    try {
      const raw = localStorage.getItem(key)
      return raw !== null ? JSON.parse(raw) as T : defaultValue
    } catch {
      return defaultValue
    }
  }

  remove(key: string): void {
    localStorage.removeItem(key)
  }

  clear(): void {
    localStorage.clear()
  }
}

export class WeChatStorage implements IStorage {
  set<T>(key: string, data: T): void {
    try {
      wx.setStorageSync(key, data)
    } catch (err) {
      console.warn(`[WeChatStorage] set failed: ${key}`, err)
    }
  }

  get<T>(key: string, defaultValue: T | null = null): T | null {
    try {
      const result = wx.getStorageSync(key)
      return result !== '' && result !== undefined ? result as T : defaultValue
    } catch {
      return defaultValue
    }
  }

  remove(key: string): void {
    wx.removeStorageSync(key)
  }

  clear(): void {
    // wx doesn't support clearSync well; iterate known keys
    console.warn('[WeChatStorage] clear not fully supported')
  }
}

export class DouyinStorage implements IStorage {
  set<T>(key: string, data: T): void {
    try {
      tt.setStorageSync(key, data)
    } catch (err) {
      console.warn(`[DouyinStorage] set failed: ${key}`, err)
    }
  }

  get<T>(key: string, defaultValue: T | null = null): T | null {
    try {
      const result = tt.getStorageSync(key)
      return result !== '' && result !== undefined ? result as T : defaultValue
    } catch {
      return defaultValue
    }
  }

  remove(key: string): void {
    tt.removeStorageSync(key)
  }

  clear(): void {
    console.warn('[DouyinStorage] clear not fully supported')
  }
}

/** Storage factory — picks the right backend automatically */
export function createStorage(): IStorage {
  if (hasWx()) return new WeChatStorage()
  if (hasTt()) return new DouyinStorage()
  return new WebStorage()
}
