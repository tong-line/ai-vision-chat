import './AiStatusIndicator.css'

export type AiStatus = 'idle' | 'listening' | 'thinking' | 'speaking'

interface AiStatusIndicatorProps {
  status: AiStatus
  liveSubtitle?: string
}

const STATUS_CONFIG: Record<
  AiStatus,
  { label: string; hint: string; color: string }
> = {
  idle: {
    label: '待命中',
    hint: '点击麦克风或输入文字开始对话',
    color: '#9aa0a6',
  },
  listening: {
    label: '正在聆听',
    hint: '请说话，识别完成后将自动发送',
    color: '#34a853',
  },
  thinking: {
    label: '正在思考',
    hint: 'AI 正在分析画面和问题...',
    color: '#f9ab00',
  },
  speaking: {
    label: '正在回复',
    hint: 'AI 正在语音回答你',
    color: '#8ab4f8',
  },
}

export function AiStatusIndicator({
  status,
  liveSubtitle,
}: AiStatusIndicatorProps) {
  const config = STATUS_CONFIG[status]

  return (
    <div className={`ai-status ai-status--${status}`}>
      <div className="ai-status__orb-wrap">
        <div
          className="ai-status__orb"
          style={{ '--orb-color': config.color } as React.CSSProperties}
        />
        {status === 'listening' && (
          <div className="ai-status__waves">
            {[0, 1, 2, 3, 4].map((i) => (
              <span key={i} className="ai-status__wave" style={{ '--i': i } as React.CSSProperties} />
            ))}
          </div>
        )}
        {status === 'speaking' && (
          <div className="ai-status__rings">
            <span className="ai-status__ring" />
            <span className="ai-status__ring ai-status__ring--delay" />
          </div>
        )}
      </div>

      <div className="ai-status__info">
        <p className="ai-status__label">{config.label}</p>
        <p className="ai-status__hint">{config.hint}</p>
        {liveSubtitle && status === 'listening' && (
          <p className="ai-status__subtitle">「{liveSubtitle}」</p>
        )}
      </div>
    </div>
  )
}
