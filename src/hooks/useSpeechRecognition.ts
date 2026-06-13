import { useCallback, useEffect, useRef, useState } from 'react'

type SpeechRecognitionInstance = {
  lang: string
  continuous: boolean
  interimResults: boolean
  start: () => void
  stop: () => void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
}

function getSpeechRecognitionCtor():
  | (new () => SpeechRecognitionInstance)
  | null {
  const win = window as Window & {
    SpeechRecognition?: new () => SpeechRecognitionInstance
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance
  }
  return win.SpeechRecognition ?? win.webkitSpeechRecognition ?? null
}

interface UseSpeechRecognitionOptions {
  onSpeechComplete?: (text: string) => void
}

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}) {
  const { onSpeechComplete } = options
  const onSpeechCompleteRef = useRef(onSpeechComplete)
  onSpeechCompleteRef.current = onSpeechComplete

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const transcriptRef = useRef('')
  const shouldAutoSendRef = useRef(false)

  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [supported] = useState(() => getSpeechRecognitionCtor() !== null)

  const stop = useCallback((cancelAutoSend = true) => {
    if (cancelAutoSend) {
      shouldAutoSendRef.current = false
    }
    recognitionRef.current?.stop()
    setIsListening(false)
  }, [])

  const start = useCallback(() => {
    const Ctor = getSpeechRecognitionCtor()
    if (!Ctor) {
      setError('当前浏览器不支持语音识别，请使用 Chrome 或 Edge')
      return
    }

    setError(null)
    setTranscript('')
    setInterimTranscript('')
    transcriptRef.current = ''
    shouldAutoSendRef.current = true

    const recognition = new Ctor()
    recognition.lang = 'zh-CN'
    recognition.continuous = false
    recognition.interimResults = true
    recognitionRef.current = recognition

    recognition.onresult = (event) => {
      let interim = ''
      let finalText = transcriptRef.current

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const text = result[0].transcript
        if (result.isFinal) {
          finalText += text
        } else {
          interim += text
        }
      }

      transcriptRef.current = finalText
      setTranscript(finalText)
      setInterimTranscript(interim)
    }

    recognition.onerror = (event) => {
      if (event.error !== 'aborted') {
        setError(`语音识别失败: ${event.error}`)
      }
      shouldAutoSendRef.current = false
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
      setInterimTranscript('')

      const finalText = transcriptRef.current.trim()
      if (shouldAutoSendRef.current && finalText) {
        onSpeechCompleteRef.current?.(finalText)
      }
      shouldAutoSendRef.current = false
    }

    recognition.start()
    setIsListening(true)
  }, [])

  useEffect(() => {
    return () => stop()
  }, [stop])

  return {
    supported,
    isListening,
    transcript,
    interimTranscript,
    liveSubtitle: `${transcript}${interimTranscript}`,
    error,
    start,
    stop: () => stop(true),
    clearTranscript: () => {
      transcriptRef.current = ''
      setTranscript('')
      setInterimTranscript('')
    },
  }
}
