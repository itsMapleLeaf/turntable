import { useEffect, useState } from "react"
import { setStreamVolume } from "~/stream-audio"

export function VolumeSlider() {
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
    setStreamVolume(volume)
  }, [volume])

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
