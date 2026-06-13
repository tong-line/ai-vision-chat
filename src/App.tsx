import { CameraPreview } from './components/CameraPreview'
import { getAppConfig } from './services/types'
import './App.css'

const STEPS = [
  { id: 1, label: '项目脚手架', status: 'done' as const },
  { id: 2, label: '摄像头 / 麦克风预览', status: 'current' as const },
  { id: 3, label: '语音识别 + 对话界面', status: 'pending' as const },
  { id: 4, label: '截图 + 多模态 AI 回复', status: 'pending' as const },
  { id: 5, label: '成本控制 + 设计文档', status: 'pending' as const },
]

function App() {
  const config = getAppConfig()
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
          七牛云实习考核项目 · 用户可通过摄像头与 AI 进行视觉对话
        </p>
      </header>

      <div className="app__layout">
        <section className="app__card">
          <CameraPreview />
        </section>

        <aside className="app__card app__sidebar">
          <div className="app__status">
            <span className="app__status-dot" />
            <span>
              对话模式：{modeLabel}
              {config.chatMode === 'direct' && '（已配置 API Key）'}
            </span>
          </div>

          <h2 className="app__sidebar-title">开发进度</h2>
          <ol className="app__steps">
            {STEPS.map((step) => (
              <li
                key={step.id}
                className={
                  step.status === 'current'
                    ? 'current'
                    : step.status === 'done'
                      ? 'done'
                      : undefined
                }
              >
                {step.label}
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </div>
  )
}

export default App
