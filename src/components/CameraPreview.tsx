import type { MediaStatus } from '../hooks/useMediaStream'
import './CameraPreview.css'

interface CameraPreviewProps {
  videoRef: React.RefObject<HTMLVideoElement | null>
  status: MediaStatus
  error: string | null
  hasVideo: boolean
  hasAudio: boolean
  onStart: () => void
  onStop: () => void
}

export function CameraPreview({
  videoRef,
  status,
  error,
  hasVideo,
  hasAudio,
  onStart,
  onStop,
}: CameraPreviewProps) {
  return (
    <section className="camera">
      <div className="camera__header">
        <h2 className="camera__title">摄像头预览</h2>
        <div className="camera__badges">
          <span className={`camera__badge ${hasVideo ? 'on' : 'off'}`}>
            摄像头 {hasVideo ? '已开启' : '未开启'}
          </span>
          <span className={`camera__badge ${hasAudio ? 'on' : 'off'}`}>
            麦克风 {hasAudio ? '已开启' : '未开启'}
          </span>
        </div>
      </div>

      <div className="camera__viewport">
        <video
          ref={videoRef}
          className="camera__video"
          autoPlay
          playsInline
          muted
        />
        {status !== 'active' && (
          <div className="camera__placeholder">
            {status === 'requesting' ? '正在请求权限...' : '点击开启摄像头和麦克风'}
          </div>
        )}
      </div>

      {error && <p className="camera__error">{error}</p>}

      <div className="camera__actions">
        {status === 'active' ? (
          <button className="camera__btn camera__btn--stop" onClick={onStop}>
            关闭
          </button>
        ) : (
          <button
            className="camera__btn camera__btn--start"
            onClick={onStart}
            disabled={status === 'requesting'}
          >
            {status === 'requesting' ? '开启中...' : '开启摄像头'}
          </button>
        )}
      </div>
    </section>
  )
}
