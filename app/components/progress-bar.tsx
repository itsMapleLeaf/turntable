import { type CSSProperties } from "react"
import { clamp } from "~/helpers/math"
import {
  useCurrentRoomQueueItem,
  useRoomSongProgress,
} from "./room-state-context"

const glowRadius = 4

export function ProgressBar() {
  const item = useCurrentRoomQueueItem()
  const progressSeconds = useRoomSongProgress()
  const progress = clamp(0.1, 0, 1)
  return (
    <div className="relative h-px w-full bg-white/25">
      <div
        className="absolute inset-0 origin-left scale-x-[--progress] bg-accent-300 shadow-[0_0_calc((1/var(--progress))*16px)_calc((1/var(--progress))*1px)_theme(colors.accent.500)] transition-transform ease-linear"
        style={{ "--progress": progress } as CSSProperties}
      />
    </div>
  )
}
