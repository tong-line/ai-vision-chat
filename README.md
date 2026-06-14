# AI 视觉对话助手

七牛云实习考核项目：基于摄像头的多模态 AI 对话应用。

用户通过摄像头和麦克风与 AI 交互，AI 能「看见」当前画面并「听懂」语音，给出文字/语音回复。

## 功能清单

- [x] 摄像头 / 麦克风采集与预览
- [x] 语音识别（STT）+ 实时字幕 + 自动发送
- [x] 视频帧截图 + 智谱 GLM-4.6V 多模态对话
- [x] Siri 式状态指示器（聆听 / 思考 / 回复）
- [x] Edge TTS 神经网络语音（失败时回退浏览器 TTS）
- [x] 端云协同成本控制（帧采样、静止检测、低分辨率、按需视觉）
- [x] 设计文档（[docs/DESIGN.md](./docs/DESIGN.md)）

## 快速开始

```bash
npm install
cp .env.example .env    # 填入智谱 API Key
npm run dev             # http://localhost:5173
```

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `VITE_CHAT_MODE` | `mock` / `direct` / `proxy` | `direct` |
| `VITE_LLM_API_KEY` | 智谱 API Key | 空 |
| `VITE_LLM_BASE_URL` | 智谱 API 地址 | `https://open.bigmodel.cn/api/paas/v4` |
| `VITE_LLM_MODEL` | 模型名称 | `glm-4.6v` |
| `VITE_TTS_PROVIDER` | `edge` / `browser` | `edge` |
| `VITE_TTS_VOICE` | Edge TTS 音色 | `zh-CN-XiaoxiaoNeural` |
| `VITE_API_BASE_URL` | 后端代理地址 | `http://localhost:3001` |

## 架构说明

- **前端**：React + Vite + TypeScript
- **AI**：智谱 GLM-4.6V 多模态 API（直连模式）
- **后端**：当前无后端；已预留 `proxy` 模式接口
- **详细设计**：见 [docs/DESIGN.md](./docs/DESIGN.md)

## 开发流程

基础功能在 `main` 分支直接提交；后续新功能通过 **feature 分支 + Pull Request** 合并，每个 PR 只做一件事。

## 仓库

https://github.com/tong-line/ai-vision-chat
