// 独立事件总线 — 替代 Cocos Component.node.emit

type Listener<T = any> = (data: T) => void

interface Handler {
  once: boolean
  fn: Listener
}

export class EventBus {
  private static _instance: EventBus
  private _handlers = new Map<string, Set<Handler>>()

  static getInstance(): EventBus {
    if (!EventBus._instance) {
      EventBus._instance = new EventBus()
    }
    return EventBus._instance
  }

  on<T = any>(event: string, fn: Listener<T>): this {
    const set = this._handlers.get(event) ?? new Set()
    set.add({ once: false, fn: fn as Listener })
    this._handlers.set(event, set)
    return this
  }

  once<T = any>(event: string, fn: Listener<T>): this {
    const set = this._handlers.get(event) ?? new Set()
    set.add({ once: true, fn: fn as Listener })
    this._handlers.set(event, set)
    return this
  }

  off(event: string, fn?: Listener): this {
    if (!fn) {
      this._handlers.delete(event)
      return this
    }
    const set = this._handlers.get(event)
    if (!set) return this
    for (const h of set) {
      if (h.fn === fn) {
        set.delete(h)
        break
      }
    }
    if (set.size === 0) this._handlers.delete(event)
    return this
  }

  emit<T = any>(event: string, data?: T): this {
    const set = this._handlers.get(event)
    if (!set) return this
    for (const h of set) {
      h.fn(data)
    }
    // remove once listeners
    for (const h of set) {
      if (h.once) set.delete(h)
    }
    if (set.size === 0) this._handlers.delete(event)
    return this
  }

  /** Remove all listeners */
  clear(): void {
    this._handlers.clear()
  }

  /** Number of listeners for a given event */
  listenerCount(event: string): number {
    return this._handlers.get(event)?.size ?? 0
  }

  /** Reset singleton (for testing) */
  static resetInstance(): void {
    EventBus._instance = new EventBus()
  }
}
