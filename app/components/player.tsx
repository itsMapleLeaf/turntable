import { PlayCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { z } from "zod"
import { delay } from "~/helpers/delay"
import { useLocalStorageState } from "~/helpers/use-local-storage-state"

const volumeSchema = z.number()

export function Player({ streamUrl }: { streamUrl: string }) {
  const [volume, setVolume] = useLocalStorageState("volume", 0.5, volumeSchema)
  const [playFailed, setPlayFailed] = useState(false)
  const muted = volume === 0

  useEffect(() => {
    const audio = ensureAudioElement()
    audio.volume = volume
  }, [volume])

  useEffect(() => {
    if (muted) return

    const audio = ensureAudioElement()
    audio.src = `${streamUrl}&nocache=${Date.now()}`

    let running = true

    void (async () => {
      while (running) {
        if (audio.paused || audio.ended) {
          try {
            await audio.play()
            setPlayFailed(false)
          } catch (error) {
            console.warn(error)
            setPlayFailed(true)
            await delay(1000)
          }
        }
        await delay(100)
      }
    })()

    return () => {
      running = false
      audio.src = ""
      audio.pause()
    }
  }, [muted, streamUrl])

  useEffect(() => {
    const audio = ensureAudioElement()
    const handlePlaying = () => setPlayFailed(false)
    audio.addEventListener("playing", handlePlaying)
    return () => {
      audio.removeEventListener("playing", handlePlaying)
    }
  }, [])

  return playFailed ? (
    <button
      type="button"
      onClick={() => {
        const audio = ensureAudioElement()
        audio.src = `${streamUrl}&nocache=${Date.now()}`
        void audio.play().then(() => setPlayFailed(false))
      }}
    >
      <PlayCircle aria-hidden className="h-8 w-8" />
      <span className="sr-only">Play</span>
    </button>
  ) : (
    <input
      type="range"
      className="w-48 max-w-full"
      min={0}
      max={1}
      step={0.01}
      value={volume}
      onChange={(event) => setVolume(event.target.valueAsNumber)}
    />
  )
}

function ensureAudioElement() {
  let element = document.querySelector<HTMLAudioElement>("[data-stream-player]")
  if (!element) {
    element = document.createElement("audio")
    element.dataset.streamPlayer = ""
    document.body.append(element)
  }
  return element
}
