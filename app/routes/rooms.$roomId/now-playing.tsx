import { useRoomTrack } from "./room-state-context"

export function NowPlaying() {
  const track = useRoomTrack()
  return (
    <div className="flex flex-1 flex-col text-center leading-5 sm:text-right">
      {track ? (
        <>
          <p className="text-sm opacity-75">Now playing</p>
          <p>{track.title}</p>
        </>
      ) : (
        <p className="opacity-75">Nothing playing</p>
      )}
    </div>
  )
}
