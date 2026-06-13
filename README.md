# AI 视觉对话助手

七牛云实习考核项目：基于摄像头的多模态 AI 对话应用。

用户通过摄像头和麦克风与 AI 交互，AI 能「看见」当前画面并「听懂」语音，给出文字/语音回复。

## 功能规划

- [x] 项目脚手架
- [ ] 摄像头 / 麦克风采集
- [ ] 语音识别（STT）与语音合成（TTS）
- [ ] 视频帧截图 + 多模态大模型对话
- [ ] 端云协同成本控制
- [ ] 设计文档

## 快速开始

```bash
# 安装依赖
npm install

# 复制环境变量（暂用 mock 模式，无需 API Key）
cp .env.example .env

# 启动开发服务器
npm run dev
```

浏览器打开终端显示的本地地址（通常是 http://localhost:5173）。

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `VITE_CHAT_MODE` | `mock` / `direct` / `proxy` | `mock` |
| `VITE_API_BASE_URL` | 后端代理地址 | `http://localhost:3001` |
| `VITE_LLM_API_KEY` | 大模型 API Key | 空 |
| `VITE_LLM_BASE_URL` | 大模型 API 地址 | 通义兼容接口 |
| `VITE_LLM_MODEL` | 模型名称 | `qwen-vl-max` |

## 架构说明

- **前端**：React + Vite + TypeScript
- **后端**：当前无后端；已预留 `proxy` 模式接口，后续可自行补充
- **详细设计**：见 [docs/DESIGN.md](./docs/DESIGN.md)

## 仓库

https://github.com/tong-line/ai-vision-chat
