import { useCallback, useEffect, useRef, useState } from 'react'
import type { AiStatus } from './components/AiStatusIndicator'
import { CameraPreview } from './components/CameraPreview'
import { ChatPanel } from './components/ChatPanel'
import { useFrameCapture } from './hooks/useFrameCapture'
import { useMediaStream } from './hooks/useMediaStream'
import { useSpeechRecognition } from './hooks/useSpeechRecognition'
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis'
import { chatService } from './services/chat'
import { FrameIntervalGate, SceneChangeDetector } from './services/costControl'
import type { Message } from './services/types'
import { getAppConfig } from './services/types'
import './App.css'

const AUTO_SEND_DELAY_MS = 1000

function createMessage(
  role: Message['role'],
  content: string,
  imageIncluded?: boolean,
): Message {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    imageIncluded,
    timestamp: Date.now(),
  }
}

function App() {
  const config = getAppConfig()
  const media = useMediaStream()
  const { captureFrame } = useFrameCapture()
  const tts = useSpeechSynthesis()

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [chatError, setChatError] = useState<string | null>(null)
  const [includeVision, setIncludeVision] = useState(true)
  const [pendingAutoSend, setPendingAutoSend] = useState<string | null>(null)
  const [costHint, setCostHint] = useState<string | null>(null)

  const messagesRef = useRef(messages)
  messagesRef.current = messages
  const frameGateRef = useRef(new FrameIntervalGate())
  const sceneDetectorRef = useRef(new SceneChangeDetector())

  const handleSendText = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || isLoading) return

      setChatError(null)
      setIsLoading(true)
      setPendingAutoSend(null)

      let image: Blob | null = null
      let imageIncluded = false
      const shouldCapture =
        includeVision && media.status === 'active' && media.hasVideo

      if (shouldCapture) {
        const intervalDecision = frameGateRef.current.check(config.frameIntervalMs)
        if (!intervalDecision.shouldSend) {
          setCostHint(intervalDecision.hint)
        } else {
          const captured = await captureFrame(media.videoRef.current)
          if (captured) {
            const sceneDecision = await sceneDetectorRef.current.check(captured)
            if (sceneDecision.shouldSend) {
              image = captured
              imageIncluded = true
              frameGateRef.current.markSent()
              setCostHint(null)
            } else {
              setCostHint(sceneDecision.hint)
            }
          }
        }
      } else {
        setCostHint(null)
      }

      const userMessage = createMessage('user', trimmed, imageIncluded)
      const history = messagesRef.current
      setMessages((prev) => [...prev, userMessage])
      setInput('')
      speechClearRef.current?.()

      try {
        const response = await chatService.sendMessage({
          text: trimmed,
          image,
          history,
        })

        const assistantMessage = createMessage(
          'assistant',
          response.reply,
          response.usage?.imageSent,
        )
        setMessages((prev) => [...prev, assistantMessage])
        tts.speak(response.reply)
      } catch (err) {
        const message = err instanceof Error ? err.message : '发送失败，请重试'
        setChatError(message)
        setMessages((prev) => prev.slice(0, -1))
        setInput(trimmed)
      } finally {
        setIsLoading(false)
      }
    },
    [
      isLoading,
      includeVision,
      media.status,
      media.hasVideo,
      media.videoRef,
      captureFrame,
      tts,
      config.frameIntervalMs,
    ],
  )

  const speechClearRef = useRef<(() => void) | null>(null)

  const speech = useSpeechRecognition({
    onSpeechComplete: (text) => {
      setInput(text)
      setPendingAutoSend(text)
    },
  })

  speechClearRef.current = speech.clearTranscript

  // 语音识别完成后延迟自动发送
  useEffect(() => {
    if (!pendingAutoSend) return

    const timer = setTimeout(() => {
      handleSendText(pendingAutoSend)
    }, AUTO_SEND_DELAY_MS)

    return () => clearTimeout(timer)
  }, [pendingAutoSend, handleSendText])

  // 手动输入时同步显示（非语音场景）
  useEffect(() => {
    if (speech.isListening && speech.transcript) {
      setInput(speech.transcript)
    }
  }, [speech.isListening, speech.transcript])

  const handleSend = () => handleSendText(input)

  const handleToggleListen = () => {
    if (speech.isListening) {
      speech.stop()
    } else {
      setPendingAutoSend(null)
      speech.start()
    }
  }

  const aiStatus: AiStatus = speech.isListening
    ? 'listening'
    : isLoading
      ? 'thinking'
      : tts.isSpeaking
        ? 'speaking'
        : 'idle'

  const modeLabel =
    config.chatMode === 'direct'
      ? '智谱 GLM-4.6V'
      : config.chatMode === 'proxy'
        ? '后端代理'
        : 'Mock 演示'

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">AI 视觉对话助手</h1>
        <p className="app__subtitle">
          七牛云实习考核项目 · 对话模式：{modeLabel}
        </p>
      </header>

      <div className="app__layout">
        <section className="app__card">
          <CameraPreview
            videoRef={media.videoRef}
            status={media.status}
            error={media.error}
            hasVideo={media.hasVideo}
            hasAudio={media.hasAudio}
            onStart={media.start}
            onStop={media.stop}
          />
        </section>

        <section className="app__card app__chat-card">
          <ChatPanel
            messages={messages}
            input={input}
            aiStatus={aiStatus}
            liveSubtitle={speech.liveSubtitle}
            isLoading={isLoading}
            isListening={speech.isListening}
            error={chatError ?? speech.error}
            costHint={costHint}
            includeVision={includeVision}
            onInputChange={setInput}
            onSend={handleSend}
            onToggleListen={handleToggleListen}
            onIncludeVisionChange={setIncludeVision}
          />
        </section>
      </div>
    </div>
  )
}

export default App
