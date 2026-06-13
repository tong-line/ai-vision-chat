import type { ChatRequest, ChatResponse, Message } from '../types'
import { getAppConfig } from '../types'

/**
 * 通过自建后端代理请求（后续自行实现）
 *
 * 预期后端接口：
 *   POST /api/chat
 *   Body: { text, imageBase64?, history? }
 *   Response: { reply, usage? }
 */
export async function sendProxyMessage(
  request: ChatRequest,
): Promise<ChatResponse> {
  const config = getAppConfig()
  const imageBase64 = request.image ? await blobToBase64(request.image) : null

  const response = await fetch(`${config.apiBaseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: request.text,
      imageBase64,
      history: serializeHistory(request.history),
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `后端代理请求失败: ${response.status} ${errorText}。请确认后端服务已启动。`,
    )
  }

  return response.json()
}

function serializeHistory(history?: Message[]) {
  return (history ?? []).map(({ role, content }) => ({ role, content }))
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result.split(',')[1] ?? '')
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}
