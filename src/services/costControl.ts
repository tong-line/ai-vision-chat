export type FrameSkipReason = 'interval' | 'static' | null

export interface FrameSendDecision {
  shouldSend: boolean
  reason: FrameSkipReason
  hint: string
}

/** 帧采样：控制两次发图之间的最小间隔 */
export class FrameIntervalGate {
  private lastSentAt = 0

  check(intervalMs: number): FrameSendDecision {
    const elapsed = Date.now() - this.lastSentAt
    if (this.lastSentAt > 0 && elapsed < intervalMs) {
      const waitSec = ((intervalMs - elapsed) / 1000).toFixed(1)
      return {
        shouldSend: false,
        reason: 'interval',
        hint: `帧采样：距上次发图不足 ${intervalMs / 1000}s，跳过截图（${waitSec}s 后可发）`,
      }
    }
    return { shouldSend: true, reason: null, hint: '' }
  }

  markSent() {
    this.lastSentAt = Date.now()
  }

  reset() {
    this.lastSentAt = 0
  }
}
