import { createContext, useContext, useEffect, useState } from "react"
import { vinylSocket } from "~/data/vinyl-socket"
import {
  type Queue,
  type QueueItem,
  type Room,
  type User,
} from "~/data/vinyl-types"

let notification: Notification | undefined

async function showNotification(options: { title: string; body: string }) {
  try {
    const permission = await Notification.requestPermission()
    if (permission !== "granted") return

    notification?.close()

    notification = new Notification("Now playing", { ...options, silent: true })
    notification.addEventListener("click", () => {
      window.focus()
      notification?.close()
      notification = undefined
    })
  } catch (error) {
    console.warn("Failed to show notification:", error)
  }
}

export function RoomStateProvider({
  room,
  queue: initialQueue,
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
  const [songProgress, setSongProgress] = useState(0)
  const [queue, setQueue] = useState(initialQueue)
  const currentQueueItem = queue.items.find(
    (item) => item.id === queue.currentItem,
  )

  useEffect(() => {
    return vinylSocket({
      url: socketUrl,
      onMessage: (message) => {
        if (message.type === "queue-update") {
          setQueue((queue) => ({ ...queue, items: message.items }))
        }

        if (message.type === "queue-advance") {
          setQueue((queue) => ({
            ...queue,
            currentItem: message.item.id,
          }))
          setSongProgress(0)
          void showNotification({
            title: "Now playing",
            body: `${message.item.track.metadata.artist} - ${message.item.track.metadata.title}`,
          })
        }

        if (message.type === "player-time") {
          setSongProgress(message.seconds)
        }
        if (message.type === "user-entered-room") {
          setMembers((members) =>
            new Map(members).set(message.user.id, message.user),
          )
          setQueue((queue) => ({
            ...queue,
            submitters: [...queue.submitters, message.user],
          }))
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
      <QueueContext.Provider value={queue}>
        <QueueCurrentItemContext.Provider value={currentQueueItem}>
          <SongProgressContext.Provider value={songProgress}>
            {children}
          </SongProgressContext.Provider>
        </QueueCurrentItemContext.Provider>
      </QueueContext.Provider>
    </MembersContext.Provider>
  )
}

const MembersContext = createContext<ReadonlyMap<string, User>>(new Map())
export const useRoomMembers = () => useContext(MembersContext)

const QueueContext = createContext<Queue>({
  id: 0,
  items: [],
  submitters: [],
})
export const useRoomQueue = () => useContext(QueueContext)

const QueueCurrentItemContext = createContext<QueueItem | undefined>(undefined)
export const useCurrentRoomQueueItem = () => useContext(QueueCurrentItemContext)

const SongProgressContext = createContext(0)
export const useRoomSongProgress = () => useContext(SongProgressContext)
