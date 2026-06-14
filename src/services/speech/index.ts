import { createBrowserTtsService } from './browserTtsService'
import { createEdgeTtsService } from './edgeTtsService'
import type { TtsProvider, TtsService } from './types'

export function createTtsService(
  provider: TtsProvider,
  onSpeakingChange: (speaking: boolean) => void,
  voice: string,
): TtsService {
  if (provider === 'edge') {
    return createEdgeTtsService(onSpeakingChange, voice)
  }
  return createBrowserTtsService(onSpeakingChange)
}

export type { TtsProvider, TtsService } from './types'
