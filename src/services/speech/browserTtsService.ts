import type { TtsService } from './types'

export function createBrowserTtsService(
  onSpeakingChange: (speaking: boolean) => void,
): TtsService {
  let speaking = false

  const setSpeaking = (value: boolean) => {
    speaking = value
    onSpeakingChange(value)
  }

  return {
    get isSpeaking() {
      return speaking
    },

    stop() {
      window.speechSynthesis.cancel()
      setSpeaking(false)
    },

    speak(text: string) {
      if (!text.trim() || !('speechSynthesis' in window)) {
        return Promise.resolve()
      }

      this.stop()

      return new Promise<void>((resolve) => {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = 'zh-CN'
        utterance.rate = 1

        const voices = window.speechSynthesis.getVoices()
        const preferred = voices.find((v) =>
          /Microsoft.*(Xiaoxiao|Huihui|Yunyang)/i.test(v.name),
        )
        if (preferred) utterance.voice = preferred

        utterance.onstart = () => setSpeaking(true)
        utterance.onend = () => {
          setSpeaking(false)
          resolve()
        }
        utterance.onerror = () => {
          setSpeaking(false)
          resolve()
        }

        window.speechSynthesis.speak(utterance)
      })
    },
  }
}
