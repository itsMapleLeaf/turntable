import { useLoaderData } from "@remix-run/react"
import { PlayCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { z } from "zod"
import { delay } from "~/helpers/delay"
import { useLocalStorageState } from "~/helpers/use-local-storage-state"
import { type loader } from "~/routes/rooms.$roomId/route"

export function Player() {
  const { streamUrl } = useLoaderData<typeof loader>()

  const [volume, setVolume] = useLocalStorageState("volume", 0.5, z.number())
  const muted = volume === 0

  const [playFailed, setPlayFailed] = useState(false)

  useEffect(() => {
    if (playFailed) return

    const audio = ensureAudioElement()

    if (muted) {
      audio.pause()
      audio.src = ""
      return
    }

    let running = true

    void (async () => {
      while (running) {
        if (audio.paused || audio.ended) {
          audio.src = `${streamUrl}&nocache=${Date.now()}`
          try {
            await audio.play()
          } catch {
            setPlayFailed(true)
          }
        }
        await delay(100)
      }
    })()

    return () => {
      running = false
    }
  }, [streamUrl, muted, playFailed])

  useEffect(() => {
    const audio = ensureAudioElement()
    audio.volume = volume
  }, [volume])

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
