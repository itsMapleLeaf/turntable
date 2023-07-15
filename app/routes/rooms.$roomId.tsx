import { ReconnectingEventSource } from "@jessestolwijk/reconnecting-event-source"
import { NavLink, Outlet, useParams } from "@remix-run/react"
import { useQueryClient } from "@tanstack/react-query"
import { getQueryKey } from "@trpc/react-query"
import { LucidePlayCircle } from "lucide-react"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { $params, $path } from "remix-routes"
import { z } from "zod"
import { AuthGuard } from "~/components/auth-guard"
import { NowPlaying } from "~/components/now-playing"
import { ProgressBar } from "~/components/progress-bar"
import { QueryResult } from "~/components/query-result"
import { Spinner } from "~/components/spinner"
import {
  vinylEventSchema,
  type Queue,
  type QueueItem,
  type Room,
  type VinylEvent,
} from "~/data/vinyl-types"
import { raise } from "~/helpers/errors"
import { useAsync } from "~/helpers/use-async"
import { useEffectEvent } from "~/helpers/use-effect-event"
import { useLocalStorageState } from "~/helpers/use-local-storage-state"
import { trpc } from "~/trpc/client"
import { RoomMembers } from "../components/room-members"

export default function RoomPage() {
  const { roomId } = $params("/rooms/:roomId", useParams())
  const roomQuery = trpc.rooms.get.useQuery({ id: roomId })
  const client = useQueryClient()

  return (
    <AuthGuard>
      <QueryResult
        query={roomQuery}
        loadingText="Loading room..."
        errorPrefix="Failed to load room"
        render={(room) => (
          <RoomPageContent
            room={room}
            queue={room.queue}
            streamUrl={room.streamUrl}
            eventsUrl={room.eventsUrl}
            onRoomChange={(newRoom) => {
              client.setQueryData(
                getQueryKey(trpc.rooms.get, { id: roomId }),
                (data) => ({ ...(data as object), ...newRoom }),
              )
            }}
            onQueueChange={(newQueue) => {
              client.setQueryData(
                getQueryKey(trpc.rooms.get, { id: roomId }),
                (data) => ({ ...(data as object), queue: newQueue }),
              )
            }}
          />
        )}
      />
    </AuthGuard>
  )
}

function RoomPageContent({
  room,
  queue,
  streamUrl,
  eventsUrl,
  onRoomChange,
  onQueueChange,
}: {
  room: Room
  queue: Queue
  streamUrl: string
  eventsUrl: string
  onRoomChange: (room: Room) => void
  onQueueChange: (queue: Queue) => void
}) {
  const roomId = room.id

  const [connected, setConnected] = useState(false)

  const [currentItemId, setCurrentItemId] = useState(queue.currentItem)
  const currentItem = queue.items.find((item) => item.id === currentItemId)

  const [progressSeconds, setProgressSeconds] = useState(0)
  const progress = currentItem
    ? progressSeconds / currentItem.track.metadata.duration
    : 0

  const [volume, setVolume] = useLocalStorageState(
    "volume",
    0.5,
    useMemo(() => z.number(), []),
  )

  const handleLiveEvent = useEffectEvent((event: VinylEvent) => {
    if (event.type === "player-time" && event.room === `room:${room.id}`) {
      setProgressSeconds(event.seconds)
    }

    if (event.type === "queue-advance" && event.queue === queue.id) {
      setCurrentItemId(event.item.id)
    }

    if (event.type === "queue-update" && event.id === queue.id) {
      onQueueChange(event)
    }

    if (event.type === "track-activation-error" && event.queue === queue.id) {
      console.warn("failed to activate track", event.track)
      // todo actual error i guess
    }

    if (
      event.type === "user-entered-room" &&
      event.room === `room:${room.id}`
    ) {
      onRoomChange({ ...room, connections: [...room.connections, event.user] })
    }
    if (event.type === "user-left-room" && event.room === `room:${room.id}`) {
      onRoomChange({
        ...room,
        connections: room.connections.filter((c) => c.id !== event.user),
      })
    }
  })

  useEffect(() => {
    const source = new ReconnectingEventSource(eventsUrl)

    source.onOpen = () => setConnected(true)
    source.onError = () => setConnected(false)
    source.onReconnected = () => setConnected(true)
    source.onMessage = ({ data }) =>
      handleLiveEvent(vinylEventSchema.parse(JSON.parse(String(data))))

    return () => source.close()
  }, [eventsUrl, handleLiveEvent])

  const [audioState, playAudio] = useAsync(
    useCallback(async () => {
      const audio = getAudioElement()
      audio.src = `${streamUrl}&t=${Date.now()}`
      await audio.play()
    }, [streamUrl]),
  )

  useEffect(() => {
    getAudioElement().volume = volume ** 2
  }, [volume])

  useEffect(() => {
    return () => getAudioElement().pause()
  }, [])

  return (
    <>
      <div className="container grid flex-1 content-start gap-4 py-4">
        <div className="panel flex flex-col gap-3 p-3">
          <header className="flex flex-wrap items-center">
            <h1 className="flex-1 text-2xl font-light">{room.name}</h1>
            <RoomMembers
              members={uniqueBy(room.connections, (item) => item.id)}
            />
          </header>
          <nav className="flex flex-row flex-wrap gap-3">
            <NavLink
              to={$path("/rooms/:roomId", { roomId })}
              end
              className="border-b-2 border-transparent font-medium uppercase opacity-50 transition hover:border-accent-200 hover:text-accent-200 [&.active]:border-current [&.active]:opacity-100"
            >
              Queue
            </NavLink>
            <NavLink
              to={$path("/rooms/:roomId/history", { roomId })}
              className="border-b-2 border-transparent font-medium uppercase opacity-50 transition hover:border-accent-200 hover:text-accent-200 [&.active]:border-current [&.active]:opacity-100"
            >
              History
            </NavLink>
          </nav>
        </div>
        <QueueContext.Provider value={queue}>
          <CurrentQueueItemContext.Provider value={currentItem}>
            <Outlet />
          </CurrentQueueItemContext.Provider>
        </QueueContext.Provider>
      </div>

      <footer className="panel sticky bottom-0">
        <ProgressBar progress={progress} />
        <div className="container flex flex-col items-center gap-4 py-4 sm:flex-row">
          <div className="flex flex-1 items-center gap-4">
            <input
              type="range"
              className="accent-accent-400"
              value={volume}
              onChange={(event) => setVolume(event.currentTarget.valueAsNumber)}
              min={0}
              max={1}
              step={0.01}
            />
            {connected ? null : <Spinner />}
            {audioState.status === "error" && (
              <button type="button" title="Play" onClick={playAudio}>
                <LucidePlayCircle />
              </button>
            )}
          </div>
          {currentItem ? (
            <NowPlaying item={currentItem} progressSeconds={progressSeconds} />
          ) : (
            <p className="opacity-75">Nothing playing</p>
          )}
        </div>
      </footer>
    </>
  )
}

function getAudioElement() {
  let element = document.querySelector(
    "audio[data-vinyl-player]",
  ) as HTMLAudioElement

  if (!element) {
    element = document.createElement("audio")
    element.dataset.vinylPlayer = ""
    document.body.append(element)
  }

  return element
}

function uniqueBy<T>(items: T[], key: (item: T) => string) {
  const seen = new Set<string>()
  return items.filter((item) => {
    const k = key(item)
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}

const QueueContext = createContext<Queue | undefined>(undefined)
export const useQueueContext = () =>
  useContext(QueueContext) ?? raise("QueueContext not found")

const CurrentQueueItemContext = createContext<QueueItem | undefined>(undefined)
export const useCurrentQueueItemContext = () =>
  useContext(CurrentQueueItemContext)
