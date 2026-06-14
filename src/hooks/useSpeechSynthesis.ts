import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createTtsService } from '../services/speech'
import type { TtsService } from '../services/speech'
import { getAppConfig } from '../services/types'

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const serviceRef = useRef<TtsService | null>(null)
  const config = getAppConfig()

  const service = useMemo(() => {
    return createTtsService(config.ttsProvider, setIsSpeaking, config.ttsVoice)
  }, [config.ttsProvider, config.ttsVoice])

  serviceRef.current = service

  const stop = useCallback(() => {
    serviceRef.current?.stop()
  }, [])

  const speak = useCallback(
    async (text: string) => {
      if (!text.trim()) return

      try {
        await serviceRef.current?.speak(text)
      } catch {
        // Edge TTS 因 CORS 等原因失败时，回退到浏览器 TTS
        if (config.ttsProvider === 'edge') {
          const fallback = createTtsService('browser', setIsSpeaking, config.ttsVoice)
          serviceRef.current = fallback
          await fallback.speak(text)
        }
      }
    },
    [config.ttsProvider, config.ttsVoice],
  )

  useEffect(() => {
    return () => stop()
  }, [stop])

  return {
    supported: true,
    provider: config.ttsProvider,
    isSpeaking,
    speak,
    stop,
  }
}
