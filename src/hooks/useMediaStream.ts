import { useCallback, useEffect, useRef, useState } from 'react'

export type MediaStatus = 'idle' | 'requesting' | 'active' | 'error'

interface UseMediaStreamResult {
  videoRef: React.RefObject<HTMLVideoElement | null>
  status: MediaStatus
  error: string | null
  hasVideo: boolean
  hasAudio: boolean
  start: () => Promise<void>
  stop: () => void
}

export function useMediaStream(): UseMediaStreamResult {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [status, setStatus] = useState<MediaStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [hasVideo, setHasVideo] = useState(false)
  const [hasAudio, setHasAudio] = useState(false)

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    setHasVideo(false)
    setHasAudio(false)
    setStatus('idle')
  }, [])

  const start = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus('error')
      setError('当前浏览器不支持摄像头/麦克风访问，请使用 Chrome 或 Edge')
      return
    }

    setStatus('requesting')
    setError(null)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: true,
      })

      streamRef.current = stream
      setHasVideo(stream.getVideoTracks().length > 0)
      setHasAudio(stream.getAudioTracks().length > 0)

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      setStatus('active')
    } catch (err) {
      stop()
      setStatus('error')

      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError') {
          setError('摄像头或麦克风权限被拒绝，请在浏览器设置中允许访问')
        } else if (err.name === 'NotFoundError') {
          setError('未检测到摄像头或麦克风设备')
        } else {
          setError(`媒体设备错误: ${err.message}`)
        }
      } else {
        setError('无法启动摄像头或麦克风')
      }
    }
  }, [stop])

  useEffect(() => {
    return () => stop()
  }, [stop])

  return {
    videoRef,
    status,
    error,
    hasVideo,
    hasAudio,
    start,
    stop,
  }
}
