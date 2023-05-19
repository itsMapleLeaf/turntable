import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { vinylSocket } from "~/data/vinyl-socket"
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
    return vinylSocket({
      url: socketUrl,
      onConnect: () => setConnected(true),
      onDisconnect: () => setConnected(false),
      onMessage: (message) => {
        const matchesRoom =
          message.room === room.id || `room:${message.room}` === room.id
        if (!matchesRoom) return

        if (message.type === "queue-update") {
          setQueue((queue) => ({
            ...queue,
            items: message.items,
            submitters: message.submitters || queue.submitters, // remove this fallback when submitters is added
          }))
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
          setMembersRecord((members) => ({
            ...members,
            [message.user.id]: message.user,
          }))
        }
        if (message.type === "user-left-room") {
          setMembersRecord((members) => {
            const newMembers = { ...members }
            delete newMembers[message.user]
            return newMembers
          })
        }
      },
    })
  }, [room.id, socketUrl])

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
