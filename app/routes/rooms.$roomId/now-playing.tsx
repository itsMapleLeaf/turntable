import prettyMs from "pretty-ms"
import { useRoomQueueItem, useRoomSongProgress } from "./room-state-context"

export function NowPlaying() {
  const item = useRoomQueueItem()
  const progress = useRoomSongProgress()
  return (
    <div className="flex flex-1 flex-col text-center leading-5 sm:text-right">
      {item ? (
        <>
          <p className="text-sm opacity-75 tabular-nums">
            {prettyMs(progress * 1000, {
              colonNotation: true,
              secondsDecimalDigits: 0,
            })}{" "}
            /{" "}
            {prettyMs(item.track.metadata.duration * 1000, {
              colonNotation: true,
              secondsDecimalDigits: 0,
            })}
          </p>
          <p className="line-clamp-1 [word-break:break-all]">
            {item.track.metadata.title}
          </p>
        </>
      ) : (
        <p className="opacity-75">Nothing playing</p>
      )}
    </div>
  )
}
