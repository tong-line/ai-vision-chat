import { useCallback } from 'react'

interface CaptureOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
}

export function useFrameCapture() {
  const captureFrame = useCallback(
    async (
      video: HTMLVideoElement | null,
      options: CaptureOptions = {},
    ): Promise<Blob | null> => {
      if (!video || video.readyState < 2) return null

      const { maxWidth = 640, maxHeight = 480, quality = 0.7 } = options
      const { width, height } = fitSize(
        video.videoWidth,
        video.videoHeight,
        maxWidth,
        maxHeight,
      )

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (!ctx) return null

      ctx.drawImage(video, 0, 0, width, height)

      return new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), 'image/jpeg', quality)
      })
    },
    [],
  )

  return { captureFrame }
}

function fitSize(
  srcWidth: number,
  srcHeight: number,
  maxWidth: number,
  maxHeight: number,
) {
  if (!srcWidth || !srcHeight) {
    return { width: maxWidth, height: maxHeight }
  }

  const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight, 1)
  return {
    width: Math.round(srcWidth * ratio),
    height: Math.round(srcHeight * ratio),
  }
}
