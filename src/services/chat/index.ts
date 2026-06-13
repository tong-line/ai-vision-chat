import type { ChatRequest, ChatResponse, ChatService } from '../types'
import { getAppConfig } from '../types'
import { sendDirectMessage } from './directChat'
import { sendMockMessage } from './mockChat'
import { sendProxyMessage } from './proxyChat'

function createChatService(): ChatService {
  const mode = getAppConfig().chatMode

  return {
    sendMessage(request: ChatRequest): Promise<ChatResponse> {
      switch (mode) {
        case 'direct':
          return sendDirectMessage(request)
        case 'proxy':
          return sendProxyMessage(request)
        case 'mock':
        default:
          return sendMockMessage(request)
      }
    },
  }
}

/** 统一入口：根据 VITE_CHAT_MODE 自动选择实现 */
export const chatService = createChatService()

export { sendDirectMessage } from './directChat'
export { sendMockMessage } from './mockChat'
export { sendProxyMessage } from './proxyChat'
