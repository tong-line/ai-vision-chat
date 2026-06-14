const EDGE_TOKEN = '6A5AA1D4EAFF4E9FB37E23D68491D6F4'
const DEFAULT_VOICE = 'zh-CN-XiaoxiaoNeural'

function escapeXml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export async function synthesizeEdgeAudio(
  text: string,
  voice = DEFAULT_VOICE,
): Promise<Blob> {
  const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="zh-CN">
    <voice name="${voice}">
      <prosody rate="+0%" pitch="+0%">${escapeXml(text)}</prosody>
    </voice>
  </speak>`

  const response = await fetch(
    `https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=${EDGE_TOKEN}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
      },
      body: ssml,
    },
  )

  if (!response.ok) {
    throw new Error(`Edge TTS 请求失败: ${response.status}`)
  }

  return response.blob()
}
