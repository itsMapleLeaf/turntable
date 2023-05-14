import { createContext, useContext, useEffect, useState } from "react"
import { vinylSocket } from "~/data/vinyl-socket"
import {
  type Queue,
  type QueueItem,
  type Room,
  type User,
} from "~/data/vinyl-types"

export function RoomStateProvider({
  room,
  queue,
  socketUrl,
  children,
}: {
  room: Room
  queue: Queue
  socketUrl: string
  children: React.ReactNode
}) {
  // use a map so we don't have duplicate users
  const [members, setMembers] = useState<ReadonlyMap<string, User>>(
    new Map(room.connections.map((user) => [user.id, user])),
  )
  const [queueItems, setQueueItems] = useState(queue.items)
  const [currentQueueItem, setCurrentQueueItem] = useState(
    queue.items.find((item) => item.id === queue.currentItem),
  )
  const [songProgress, setSongProgress] = useState(0)

  useEffect(() => {
    return vinylSocket({
      url: socketUrl,
      onMessage: (message) => {
        if (message.type === "queue-update") {
          setQueueItems(message.items)
        }

        if (message.type === "queue-advance") {
          setCurrentQueueItem(message.item)
          setSongProgress(0)

          Notification.requestPermission()
            .then((permission) => {
              if (permission === "granted") {
                new Notification("Now playing", {
                  body: message.item.track.metadata.title,
                  silent: true,
                })
              }
            })
            .catch((error) => {
              console.warn("Failed to request permissions:", error)
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

  useEffect(() => {
    if (!currentQueueItem) return

    const { metadata } = currentQueueItem.track
    navigator.mediaSession.metadata = new MediaMetadata({
      title: metadata.title,
      artist: metadata.artist,
      ...(metadata.artwork && { artwork: [{ src: metadata.artwork }] }),
    })
    document.title = `${metadata.artist} - ${metadata.title} | Turntable`
  }, [currentQueueItem])

  return (
    <MembersContext.Provider value={members}>
      <QueueContext.Provider value={queueItems}>
        <QueueItemContext.Provider value={currentQueueItem}>
          <SongProgressContext.Provider value={songProgress}>
            {children}
          </SongProgressContext.Provider>
        </QueueItemContext.Provider>
      </QueueContext.Provider>
    </MembersContext.Provider>
  )
}

const MembersContext = createContext<ReadonlyMap<string, User>>(new Map())
export const useRoomMembers = () => useContext(MembersContext)

const QueueContext = createContext<QueueItem[]>([])
export const useRoomQueue = () => useContext(QueueContext)

const QueueItemContext = createContext<QueueItem | undefined>(undefined)
export const useRoomQueueItem = () => useContext(QueueItemContext)

const SongProgressContext = createContext(0)
export const useRoomSongProgress = () => useContext(SongProgressContext)
