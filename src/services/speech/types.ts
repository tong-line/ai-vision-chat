export type TtsProvider = 'browser' | 'edge'

export interface TtsService {
  speak(text: string): Promise<void>
  stop(): void
  readonly isSpeaking: boolean
}
