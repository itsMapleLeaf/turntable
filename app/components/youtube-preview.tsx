import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react"
import createYouTubePlayer from "youtube-player"
import { type YouTubePlayer } from "youtube-player/dist/types"

const YouTubePreviewContext = createContext({
  open: false,
  setOpen: (open: boolean) => {},
  videoId: "",
  setVideoId: (videoId: string) => {},
})

export function YouTubePreviewProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [videoId, setVideoId] = useState("")
  return (
    <YouTubePreviewContext.Provider
      value={{ open, setOpen, videoId, setVideoId }}
    >
      {children}
    </YouTubePreviewContext.Provider>
  )
}

export function useYouTubePreview() {
  const context = useContext(YouTubePreviewContext)

  const play = (videoId: string) => {
    context.setVideoId(videoId)
    context.setOpen(true)
  }

  const stop = () => {
    context.setOpen(false)
  }

  return { play, stop, playing: context.open, videoId: context.videoId }
}

export function YouTubePreview({ volume }: { volume: number }) {
  const context = useContext(YouTubePreviewContext)
  const playerId = useId()
  const playerRef = useRef<YouTubePlayer>()

  useEffect(() => {
    if (context.open) {
      const player = (playerRef.current = createYouTubePlayer(playerId))

      void (async () => {
        await player.loadVideoById(context.videoId)
        await player.playVideo()
        await new Promise((resolve) => setTimeout(resolve, 1000)) // this makes seek work more reliably
        const duration = await player.getDuration()
        await player.seekTo(Math.min(30, duration * 0.25), true)
      })()

      return () => {
        void player.destroy()
        playerRef.current = undefined
      }
    }
  }, [context.open, context.videoId, playerId])

  useEffect(() => {
    void playerRef.current?.setVolume(volume * 100)
  }, [volume, context.open, context.videoId])

  return <div id={playerId} className="sr-only" />
}
