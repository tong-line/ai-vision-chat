export type MessageRole = 'user' | 'assistant'

export interface Message {
  id: string
  role: MessageRole
  content: string
  imageIncluded?: boolean
  timestamp: number
}

export interface ChatRequest {
  text: string
  image?: Blob | null
  history?: Message[]
}

export interface ChatUsage {
  promptTokens?: number
  completionTokens?: number
  imageSent: boolean
}

export interface ChatResponse {
  reply: string
  usage?: ChatUsage
}

export interface ChatService {
  sendMessage(request: ChatRequest): Promise<ChatResponse>
}

export type ChatMode = 'mock' | 'direct' | 'proxy'
export type TtsProvider = 'browser' | 'edge'

export interface AppConfig {
  chatMode: ChatMode
  apiBaseUrl: string
  llmApiKey: string
  llmBaseUrl: string
  llmModel: string
  frameIntervalMs: number
  maxHistoryRounds: number
  ttsProvider: TtsProvider
  ttsVoice: string
}

export function getAppConfig(): AppConfig {
  return {
    chatMode: (import.meta.env.VITE_CHAT_MODE as ChatMode) || 'mock',
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
    llmApiKey: import.meta.env.VITE_LLM_API_KEY || '',
    llmBaseUrl:
      import.meta.env.VITE_LLM_BASE_URL ||
      'https://open.bigmodel.cn/api/paas/v4',
    llmModel: import.meta.env.VITE_LLM_MODEL || 'glm-4.6v',
    frameIntervalMs: 3000,
    maxHistoryRounds: 10,
    ttsProvider: (import.meta.env.VITE_TTS_PROVIDER as TtsProvider) || 'edge',
    ttsVoice: import.meta.env.VITE_TTS_VOICE || 'zh-CN-XiaoxiaoNeural',
  }
}
