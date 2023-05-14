import prettyMs from "pretty-ms"
import {
  useCurrentRoomQueueItem,
  useRoomSongProgress,
} from "./room-state-context"

export function NowPlaying() {
  const item = useCurrentRoomQueueItem()
  const progress = useRoomSongProgress()
  return (
    <div className="flex flex-1 flex-col justify-center text-center leading-5 gap-2 sm:flex-row items-center sm:text-right sm:justify-end">
      {item ? (
        <>
          <div>
            <p className="text-sm opacity-75 tabular-nums">
              {item.track.metadata.artist} &bull;{" "}
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
          </div>
          {item.track.metadata.artwork && (
            <img
              src={item.track.metadata.artwork}
              alt=""
              className="w-12 h-12 ml-2 object-cover"
            />
          )}
        </>
      ) : (
        <p className="opacity-75">Nothing playing</p>
      )}
    </div>
  )
}
