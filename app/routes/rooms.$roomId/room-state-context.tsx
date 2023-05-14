import { createContext, useContext, useEffect, useState } from "react"
import { vinylSocket } from "~/data/vinyl-socket"
import { type Room, type Track, type User } from "~/data/vinyl-types"
import { type Nullish } from "~/helpers/types"

export function RoomStateProvider({
  room,
  socketUrl,
  children,
}: {
  room: Room
  socketUrl: string
  children: React.ReactNode
}) {
  // use a map so we don't have duplicate users
  const [members, setMembers] = useState<ReadonlyMap<string, User>>(
    new Map(room.connections.map((user) => [user.id, user])),
  )
  const [track, setTrack] = useState(room.currentTrack)
  const [songProgress, setSongProgress] = useState(0)

  useEffect(() => {
    return vinylSocket({
      url: socketUrl,
      onMessage: (message) => {
        if (message.type === "track-update") {
          setTrack(message.track)
          setSongProgress(0)

          Notification.requestPermission()
            .then((permission) => {
              if (permission === "granted") {
                new Notification("Now playing", { body: message.track.title })
              }
            })
            .catch((error) => {
              console.error("Failed to request permissions:", error)
            })
        }

        if (message.type === "player-time") {
          setSongProgress(message.seconds)
        }
        if (message.type === "user-entered-room") {
          setMembers((members) =>
            new Map(members).set(message.user.id, message.user),
          )
        }
        if (message.type === "user-left-room") {
          setMembers((members) => {
            const newMembers = new Map(members)
            newMembers.delete(message.user)
            return newMembers
          })
        }
      },
    })
  }, [socketUrl])

  return (
    <MembersContext.Provider value={members}>
      <TrackContext.Provider value={track}>
        <SongProgressContext.Provider value={songProgress}>
          {children}
        </SongProgressContext.Provider>
      </TrackContext.Provider>
    </MembersContext.Provider>
  )
}

const MembersContext = createContext<ReadonlyMap<string, User>>(new Map())
export const useRoomMembers = () => useContext(MembersContext)

const TrackContext = createContext<Nullish<Track>>(undefined)
export const useRoomTrack = () => useContext(TrackContext)

const SongProgressContext = createContext(0)
export const useRoomSongProgress = () => useContext(SongProgressContext)
