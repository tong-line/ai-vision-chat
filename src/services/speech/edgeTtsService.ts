import { synthesizeEdgeAudio } from './edgeTts'
import type { TtsService } from './types'

export function createEdgeTtsService(
  onSpeakingChange: (speaking: boolean) => void,
  voice: string,
): TtsService {
  let audio: HTMLAudioElement | null = null
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
      if (audio) {
        audio.pause()
        audio.src = ''
        audio = null
      }
      setSpeaking(false)
    },

    async speak(text: string) {
      if (!text.trim()) return

      this.stop()

      try {
        const blob = await synthesizeEdgeAudio(text, voice)
        audio = new Audio(URL.createObjectURL(blob))
        setSpeaking(true)

        await new Promise<void>((resolve, reject) => {
          if (!audio) return resolve()

          audio.onended = () => {
            URL.revokeObjectURL(audio!.src)
            setSpeaking(false)
            resolve()
          }
          audio.onerror = () => {
            URL.revokeObjectURL(audio!.src)
            setSpeaking(false)
            reject(new Error('Edge TTS 播放失败'))
          }
          audio.play().catch(reject)
        })
      } catch (err) {
        setSpeaking(false)
        throw err
      }
    },
  }
}
