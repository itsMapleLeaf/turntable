import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { vinylEvents } from "~/data/vinyl-events"
import {
  type Queue,
  type QueueItem,
  type Room,
  type User,
} from "~/data/vinyl-types"
import { showNotification } from "~/helpers/notifications"

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
  const [connected, setConnected] = useState(false)
  const [membersRecord, setMembersRecord] = useState(() => {
    return Object.fromEntries(room.connections.map((user) => [user.id, user]))
  })
  const [songProgress, setSongProgress] = useState(0)
  const [queue, setQueue] = useState(initialQueue)

  const members = useMemo(() => Object.values(membersRecord), [membersRecord])

  const currentQueueItem = queue.items.find(
    (item) => item.id === queue.currentItem,
  )

  useEffect(() => {
    return vinylEvents({
      url: socketUrl,
      onConnect: () => setConnected(true),
      onDisconnect: () => setConnected(false),
      onMessage: (message) => {
        if (
          message.type === "track-activation-error" &&
          message.queue === queue.id
        ) {
          console.warn("failed to activate track", message.track)
          // todo actual error i guess
        }

        if (message.type === "queue-update" && message.id === queue.id) {
          setQueue((queue) => ({
            ...queue,
            items: message.items,
            submitters: message.submitters,
            currentItem: message.currentItem,
          }))
        }

        if (message.type === "queue-advance" && message.queue === queue.id) {
          setQueue((queue) => ({
            ...queue,
            currentItem: message.item.id,
          }))
          setSongProgress(0)

          if (!document.hasFocus()) {
            void showNotification({
              title: "Now playing",
              body: `${message.item.track.metadata.artist} - ${message.item.track.metadata.title}`,
            })
          }
        }

        if (
          message.type === "player-time" &&
          message.room === `room:${room.id}`
        ) {
          setSongProgress(message.seconds)
        }

        if (
          message.type === "user-entered-room" &&
          message.room === `room:${room.id}`
        ) {
          setMembersRecord((members) => ({
            ...members,
            [message.user.id]: message.user,
          }))
        }

        if (
          message.type === "user-left-room" &&
          message.room === `room:${room.id}`
        ) {
          setMembersRecord((members) => {
            const newMembers = { ...members }
            delete newMembers[message.user]
            return newMembers
          })
        }
      },
    })
  }, [queue.id, room.id, socketUrl])

  useEffect(() => {
    const { metadata } = currentQueueItem?.track ?? {}
    if (metadata) {
      document.title = `${metadata.artist} - ${metadata.title} | Turntable`
      navigator.mediaSession.metadata = new MediaMetadata({
        title: metadata.title,
        artist: metadata.artist,
        ...(metadata.artwork && { artwork: [{ src: metadata.artwork }] }),
      })
    } else {
      document.title = `Nothing Playing | Turntable`
      navigator.mediaSession.metadata = null
    }
  }, [currentQueueItem])

  return (
    <MembersContext.Provider value={members}>
      <QueueContext.Provider value={queue}>
        <QueueCurrentItemContext.Provider value={currentQueueItem}>
          <SongProgressContext.Provider value={songProgress}>
            <ConnectedContext.Provider value={connected}>
              {children}
            </ConnectedContext.Provider>
          </SongProgressContext.Provider>
        </QueueCurrentItemContext.Provider>
      </QueueContext.Provider>
    </MembersContext.Provider>
  )
}

const MembersContext = createContext<User[]>([])
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

const ConnectedContext = createContext(false)
export const useRoomConnected = () => useContext(ConnectedContext)
