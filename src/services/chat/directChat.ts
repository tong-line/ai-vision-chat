import type { ChatRequest, ChatResponse, Message } from '../types'
import { getAppConfig } from '../types'

/** 浏览器直连智谱大模型 API（OpenAI 兼容格式） */
export async function sendDirectMessage(
  request: ChatRequest,
): Promise<ChatResponse> {
  const config = getAppConfig()

  if (!config.llmApiKey) {
    throw new Error('未配置 VITE_LLM_API_KEY，请在 .env 中填写或改用 mock 模式')
  }

  const messages = await buildMessages(request)
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
      temperature: 0.7,
      max_tokens: 1024,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`智谱 API 请求失败: ${response.status} ${errorText}`)
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
  const history = trimHistory(request.history ?? [], getAppConfig().maxHistoryRounds)
  const pastMessages = history.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }))

  const currentContent = await buildCurrentContent(request)

  return [...pastMessages, { role: 'user' as const, content: currentContent }]
}

async function buildCurrentContent(request: ChatRequest) {
  const parts: Array<
    { type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } }
  > = []

  // 智谱文档惯例：图片放文字前面
  if (request.image) {
    const base64 = await blobToBase64(request.image)
    parts.push({
      type: 'image_url',
      image_url: { url: `data:image/jpeg;base64,${base64}` },
    })
  }

  parts.push({ type: 'text', text: request.text })

  return parts.length === 1 && parts[0].type === 'text'
    ? request.text
    : parts
}

function trimHistory(history: Message[], maxRounds: number) {
  const maxMessages = maxRounds * 2
  return history.slice(-maxMessages)
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
