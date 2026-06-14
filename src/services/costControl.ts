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

const SAMPLE_SIZE = 32

/** 静止检测：对比前后帧像素差异，画面几乎不变则跳过发图 */
export class SceneChangeDetector {
  private lastSignature: number[] | null = null

  async check(image: Blob, threshold = 0.03): Promise<FrameSendDecision> {
    const signature = await computeSignature(image)

    if (this.lastSignature) {
      const diff = averageDiff(this.lastSignature, signature)
      if (diff < threshold) {
        return {
          shouldSend: false,
          reason: 'static',
          hint: '静止检测：画面无明显变化，跳过截图以节省成本',
        }
      }
    }

    this.lastSignature = signature
    return { shouldSend: true, reason: null, hint: '' }
  }

  updateBaseline(image: Blob) {
    computeSignature(image).then((sig) => {
      this.lastSignature = sig
    })
  }

  reset() {
    this.lastSignature = null
  }
}

async function computeSignature(blob: Blob): Promise<number[]> {
  const bitmap = await createImageBitmap(blob)
  const canvas = document.createElement('canvas')
  canvas.width = SAMPLE_SIZE
  canvas.height = SAMPLE_SIZE

  const ctx = canvas.getContext('2d')
  if (!ctx) return []

  ctx.drawImage(bitmap, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE)
  bitmap.close()

  const { data } = ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE)
  const signature: number[] = []
  for (let i = 0; i < data.length; i += 4) {
    signature.push((data[i] + data[i + 1] + data[i + 2]) / 3)
  }
  return signature
}

function averageDiff(a: number[], b: number[]): number {
  const len = Math.min(a.length, b.length)
  if (len === 0) return 1

  let sum = 0
  for (let i = 0; i < len; i++) {
    sum += Math.abs(a[i] - b[i]) / 255
  }
  return sum / len
}
