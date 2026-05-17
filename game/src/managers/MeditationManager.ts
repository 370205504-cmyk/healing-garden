// 冥想管理器 — 纯逻辑层，零引擎依赖

import { EventBus } from '../core/EventBus'

export interface MeditationSession {
  startTime: number
  duration: number
  completed: boolean
  flowersUnlocked: number
  coinsEarned: number
}

export interface MeditationStats {
  totalSessions: number
  totalDuration: number
  longestSession: number
  lastSessionDate: number
}

export class MeditationManager {
  private eventBus: EventBus
  private currentSession: MeditationSession | null = null
  private stats: MeditationStats = {
    totalSessions: 0,
    totalDuration: 0,
    longestSession: 0,
    lastSessionDate: 0,
  }

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus
  }

  start(now: number): boolean {
    if (this.currentSession) return false

    this.currentSession = {
      startTime: now,
      duration: 0,
      completed: false,
      flowersUnlocked: 0,
      coinsEarned: 0,
    }

    this.eventBus.emit('meditation:started', { startTime: now })
    return true
  }

  update(now: number): void {
    if (!this.currentSession || this.currentSession.completed) return
    this.currentSession.duration = now - this.currentSession.startTime
  }

  end(now: number): MeditationSession | null {
    if (!this.currentSession) return null

    const session = this.currentSession
    const elapsed = now - session.startTime

    session.completed = true
    session.duration = elapsed
    session.coinsEarned = Math.floor(elapsed / 30)
    session.flowersUnlocked = Math.floor(elapsed / 120)

    this.stats.totalSessions++
    this.stats.totalDuration += elapsed
    this.stats.longestSession = Math.max(this.stats.longestSession, elapsed)
    this.stats.lastSessionDate = now

    this.currentSession = null
    this.eventBus.emit('meditation:completed', session)
    return session
  }

  isMeditating(): boolean {
    return this.currentSession !== null
  }

  getCurrentSession(): MeditationSession | null {
    return this.currentSession
  }

  getStats(): MeditationStats {
    return { ...this.stats }
  }

  serialize(): Record<string, unknown> {
    return {
      currentSession: this.currentSession,
      stats: this.stats,
    }
  }

  deserialize(data: Record<string, unknown>): void {
    if (data.currentSession) {
      this.currentSession = data.currentSession as MeditationSession
    }
    if (data.stats) {
      this.stats = data.stats as MeditationStats
    }
  }
}
