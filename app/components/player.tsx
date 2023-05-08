import { PlayCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { vinylSocket } from "~/vinyl/vinyl-socket"
import { type Room, type Track, type User } from "~/vinyl/vinyl-types"

type RoomState = {
  members: User[]
  track?: Track
  songProgress: number
}

export function Player({
  socketUrl,
  room,
  audio,
}: {
  socketUrl: string
  room: Room
  audio: HTMLAudioElement
}) {
  const [playing, setPlaying] = useState(!audio.paused)
  useEffect(() => {
    const handlePlay = () => setPlaying(true)
    const handlePause = () => setPlaying(false)

    audio.addEventListener("play", handlePlay)
    audio.addEventListener("pause", handlePause)

    return () => {
      audio.removeEventListener("play", handlePlay)
      audio.removeEventListener("pause", handlePause)
    }
  }, [audio])

  const [roomState, setRoomState] = useState<RoomState>({
    members: room.connections,
    songProgress: 0,
  })

  useEffect(() => {
    return vinylSocket({
      url: socketUrl,
      onMessage: (message) => {
        if (message.type === "track-update") {
          setRoomState((state) => ({
            ...state,
            track: message.track,
            songProgress: 0,
          }))
        }
        if (message.type === "player-time") {
          setRoomState((state) => ({
            ...state,
            songProgress: message.seconds,
          }))
        }
      },
    })
  }, [socketUrl])

  const progress = roomState.songProgress / (roomState.track?.duration ?? 180)

  return (
    <footer className="panel sticky bottom-0 overflow-clip">
      <div className="relative h-px w-full bg-white/25">
        <div
          className="h-full origin-left bg-accent-300"
          style={{ transform: `scaleX(${progress})` }}
        />
        <div
          className="top-full h-3 origin-left bg-gradient-to-b from-accent-400/30 via-accent-400/10"
          style={{ transform: `scaleX(${progress})` }}
        />
      </div>

      <div className="container flex flex-col items-center gap-4 py-4 sm:flex-row">
        {playing && audio ? (
          <VolumeSlider audio={audio} />
        ) : (
          <button
            type="button"
            onClick={() => {
              audio.play().catch((error) => {
                console.error("Failed to play audio:", error)
              })
            }}
          >
            <PlayCircle aria-hidden className="h-8 w-8" />
            <span className="sr-only">Play</span>
          </button>
        )}

        <div className="flex flex-1 flex-col text-center leading-5 sm:text-right">
          {roomState.track ? (
            <>
              <p className="text-sm opacity-75">Now playing</p>
              <p>{roomState.track.title}</p>
            </>
          ) : (
            <p className="opacity-75">Nothing playing</p>
          )}
        </div>
      </div>
    </footer>
  )
}

function VolumeSlider({ audio }: { audio: HTMLAudioElement }) {
  const [volume, setVolume] = useState(0.5)

  useEffect(() => {
    const storedVolume = localStorage.getItem("volume")
    if (!storedVolume) return

    const storedVolumeNumber = Number(storedVolume)
    if (!Number.isFinite(storedVolumeNumber)) return

    setVolume(storedVolumeNumber)
  }, [])

  function handleVolumeChange(event: React.ChangeEvent<HTMLInputElement>) {
    const newVolume = event.currentTarget.valueAsNumber
    setVolume(newVolume)
    localStorage.setItem("volume", String(newVolume))
  }

  useEffect(() => {
    audio.volume = volume ** 2
  }, [audio, volume])

  return (
    <input
      type="range"
      className="w-48"
      min={0}
      max={1}
      step={0.01}
      value={volume}
      onChange={handleVolumeChange}
    />
  )
}
