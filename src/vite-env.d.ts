/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CHAT_MODE: 'mock' | 'direct' | 'proxy'
  readonly VITE_API_BASE_URL: string
  readonly VITE_LLM_API_KEY: string
  readonly VITE_LLM_BASE_URL: string
  readonly VITE_LLM_MODEL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
}

interface SpeechRecognitionResultList {
  length: number
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative
  isFinal: boolean
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}
