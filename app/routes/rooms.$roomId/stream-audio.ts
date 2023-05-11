import { useEffect, useState } from "react"

let audio: HTMLAudioElement | undefined

function getStreamAudioElement(): HTMLAudioElement {
  if (!audio) {
    const element = document.createElement("audio")

    // ensure it continues playing if it ends
    element.addEventListener("ended", () => {
      const url = new URL(element.currentSrc)
      url.searchParams.set("nocache", String(Date.now()))
      element.src = url.href

      element.play().catch((error) => {
        console.error("Failed to play audio:", error)
      })
    })

    document.body.append(element)
    audio = element
  }
  return audio
}

export function playStream(url: string) {
  const audio = getStreamAudioElement()
  audio.src = url
  audio.play().catch((error) => {
    console.error("Failed to play audio:", error)
  })
}

export function stopStream() {
  const audio = getStreamAudioElement()
  audio.src = ""
  audio.pause()
}

export function setStreamVolume(volume: number) {
  const audio = getStreamAudioElement()
  audio.volume = volume
}

export function useStreamPlaying() {
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const audio = getStreamAudioElement()
    setPlaying(!audio.paused)

    const handlePlay = () => setPlaying(true)
    const handlePause = () => setPlaying(false)

    audio.addEventListener("play", handlePlay)
    audio.addEventListener("pause", handlePause)

    return () => {
      audio.removeEventListener("play", handlePlay)
      audio.removeEventListener("pause", handlePause)
    }
  }, [])

  return playing
}
