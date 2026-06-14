import { useEffect, useRef } from 'react'
import { AiStatusIndicator, type AiStatus } from './AiStatusIndicator'
import type { Message } from '../services/types'
import './ChatPanel.css'

interface ChatPanelProps {
  messages: Message[]
  input: string
  aiStatus: AiStatus
  liveSubtitle: string
  isLoading: boolean
  isListening: boolean
  error: string | null
  costHint?: string | null
  includeVision: boolean
  onInputChange: (value: string) => void
  onSend: () => void
  onToggleListen: () => void
  onIncludeVisionChange: (value: boolean) => void
}

export function ChatPanel({
  messages,
  input,
  aiStatus,
  liveSubtitle,
  isLoading,
  isListening,
  error,
  costHint,
  includeVision,
  onInputChange,
  onSend,
  onToggleListen,
  onIncludeVisionChange,
}: ChatPanelProps) {
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages, isLoading])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  return (
    <section className="chat">
      <AiStatusIndicator status={aiStatus} liveSubtitle={liveSubtitle} />

      <div className="chat__header">
        <h2 className="chat__title">AI 对话</h2>
        <label className="chat__vision-toggle">
          <input
            type="checkbox"
            checked={includeVision}
            onChange={(e) => onIncludeVisionChange(e.target.checked)}
          />
          附带当前画面
        </label>
      </div>

      <div className="chat__messages" ref={listRef}>
        {messages.length === 0 && (
          <p className="chat__empty">
            开启摄像头后，点击麦克风说话（自动发送），或直接输入文字提问。
          </p>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`chat__bubble chat__bubble--${msg.role}`}>
            <span className="chat__role">
              {msg.role === 'user' ? '你' : 'AI'}
              {msg.imageIncluded ? ' 📷' : ''}
            </span>
            <p className="chat__text">{msg.content}</p>
          </div>
        ))}

        {isLoading && (
          <div className="chat__bubble chat__bubble--assistant">
            <span className="chat__role">AI</span>
            <p className="chat__text chat__text--loading">思考中...</p>
          </div>
        )}
      </div>

      {error && <p className="chat__error">{error}</p>}
      {costHint && !error && <p className="chat__cost-hint">{costHint}</p>}

      <div className="chat__composer">
        <button
          className={`chat__mic ${isListening ? 'active' : ''}`}
          onClick={onToggleListen}
          title="语音输入（说完自动发送）"
          type="button"
        >
          {isListening ? '🔴' : '🎤'}
        </button>

        <textarea
          className="chat__input"
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入问题，或点击麦克风说话..."
          rows={2}
          disabled={isLoading}
        />

        <button
          className="chat__send"
          onClick={onSend}
          disabled={isLoading || !input.trim()}
          type="button"
        >
          发送
        </button>
      </div>

      <p className="chat__hint">
        {isListening && '实时识别中，停顿后自动发送...'}
        {!isListening && aiStatus === 'speaking' && 'AI 正在朗读回复...'}
        {!isListening && aiStatus === 'idle' && '语音输入自动发送 · Enter 手动发送'}
      </p>
    </section>
  )
}
