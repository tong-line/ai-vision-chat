import type { ChatRequest, ChatResponse } from '../types'

/** 无 API Key 时的演示实现，返回固定/mock 回复 */
export async function sendMockMessage(
  request: ChatRequest,
): Promise<ChatResponse> {
  await delay(600)

  const hasImage = Boolean(request.image)
  const preview = request.text.slice(0, 40)

  return {
    reply: hasImage
      ? `【Mock 模式】我已收到你的问题「${preview}」和一张截图。配置 API Key 后将由真实多模态模型回答。`
      : `【Mock 模式】我已收到你的问题「${preview}」。配置 API Key 后将由真实模型回答。`,
    usage: {
      imageSent: hasImage,
      promptTokens: 0,
      completionTokens: 0,
    },
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
