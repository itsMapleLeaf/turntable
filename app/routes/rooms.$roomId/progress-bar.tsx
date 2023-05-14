import { clamp } from "~/helpers/math"
import { useRoomQueueItem, useRoomSongProgress } from "./room-state-context"

const glowRadius = 4

export function ProgressBar() {
  const item = useRoomQueueItem()
  const progressSeconds = useRoomSongProgress()
  const progress = clamp(
    progressSeconds / (item?.track.metadata.duration ?? 240),
    0,
    1,
  )
  return (
    <div className="relative h-px w-full bg-white/25">
      <div
        className="absolute -inset-y-1 origin-left rounded-full bg-accent-500 opacity-30 transition-[right] ease-linear"
        style={{
          left: -glowRadius,
          right: `calc(${-glowRadius}px + ${(1 - progress) * 100}%)`,
          filter: `blur(${glowRadius}px)`,
        }}
      />
      <div
        className="absolute inset-0 origin-left bg-accent-300 transition-transform ease-linear"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  )
}
