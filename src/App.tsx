import './App.css'

type StepStatus = 'done' | 'current' | 'pending'

const STEPS: { id: number; label: string; status: StepStatus }[] = [
  { id: 1, label: '项目脚手架（当前）', status: 'current' },
  { id: 2, label: '摄像头 / 麦克风预览', status: 'pending' },
  { id: 3, label: '语音识别 + 对话界面', status: 'pending' },
  { id: 4, label: '截图 + 多模态 AI 回复', status: 'pending' },
  { id: 5, label: '成本控制 + 设计文档', status: 'pending' },
]

function App() {
  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">AI 视觉对话助手</h1>
        <p className="app__subtitle">
          七牛云实习考核项目 · 用户可通过摄像头与 AI 进行视觉对话
        </p>
      </header>

      <section className="app__card">
        <div className="app__status">
          <span className="app__status-dot" />
          <span>开发环境已就绪，API Key 暂未配置（使用 mock 模式）</span>
        </div>

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
      </section>
    </div>
  )
}

export default App
