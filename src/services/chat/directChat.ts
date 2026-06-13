import type { ChatRequest, ChatResponse } from '../types'
import { getAppConfig } from '../types'

/** 浏览器直连大模型 API（OpenAI 兼容格式） */
export async function sendDirectMessage(
  request: ChatRequest,
): Promise<ChatResponse> {
  const config = getAppConfig()

  if (!config.llmApiKey) {
    throw new Error('未配置 VITE_LLM_API_KEY，请在 .env 中填写或改用 mock 模式')
  }

  const messages = buildMessages(request)
  const hasImage = Boolean(request.image)

  const response = await fetch(`${config.llmBaseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.llmApiKey}`,
    },
    body: JSON.stringify({
      model: config.llmModel,
      messages,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`大模型 API 请求失败: ${response.status} ${errorText}`)
  }

  const data = await response.json()
  const reply = data.choices?.[0]?.message?.content ?? '（无回复内容）'

  return {
    reply,
    usage: {
      imageSent: hasImage,
      promptTokens: data.usage?.prompt_tokens,
      completionTokens: data.usage?.completion_tokens,
    },
  }
}

async function buildMessages(request: ChatRequest) {
  const content: Array<
    { type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } }
  > = [{ type: 'text', text: request.text }]

  if (request.image) {
    const base64 = await blobToBase64(request.image)
    content.push({
      type: 'image_url',
      image_url: { url: `data:image/jpeg;base64,${base64}` },
    })
  }

  return [{ role: 'user', content }]
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
