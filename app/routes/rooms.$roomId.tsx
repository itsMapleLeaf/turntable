import { ReconnectingEventSource } from "@jessestolwijk/reconnecting-event-source"
import { NavLink, Outlet, useParams } from "@remix-run/react"
import { LucidePlayCircle } from "lucide-react"
import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { $params, $path } from "remix-routes"
import { z } from "zod"
import { AuthGuard } from "~/components/auth-guard"
import { NowPlaying } from "~/components/now-playing"
import { ProgressBar } from "~/components/progress-bar"
import { QueryResult } from "~/components/query-result"
import { Spinner } from "~/components/spinner"
import {
  YouTubePreviewProvider,
  useYouTubePreview,
} from "~/components/youtube-preview-dialog"
import {
  vinylEventSchema,
  type Queue,
  type QueueItem,
  type VinylEvent,
} from "~/data/vinyl-types"
import { raise } from "~/helpers/errors"
import { showNotification } from "~/helpers/notifications"
import { useEffectEvent } from "~/helpers/use-effect-event"
import { useLocalStorageState } from "~/helpers/use-local-storage-state"
import { trpc } from "~/trpc/client"
import { type AppRouterOutput } from "~/trpc/router.server"
import { RoomMembers } from "../components/room-members"

export default function RoomPage() {
  const { roomId } = $params("/rooms/:roomId", useParams())
  const roomQuery = trpc.rooms.get.useQuery({ id: roomId })
  return (
    <AuthGuard>
      <YouTubePreviewProvider>
        <QueryResult
          query={roomQuery}
          loadingText="Loading room..."
          errorPrefix="Failed to load room"
          render={(room) => <RoomPageContent room={room} />}
        />
      </YouTubePreviewProvider>
    </AuthGuard>
  )
}

function RoomPageContent({ room }: { room: AppRouterOutput["rooms"]["get"] }) {
  const [connected, setConnected] = useState(false)

  const [currentItemId, setCurrentItemId] = useState(room.queue.currentItem)
  const currentItem = room.queue.items.find((item) => item.id === currentItemId)

  const [progressSeconds, setProgressSeconds] = useState(0)
  const progress = currentItem
    ? progressSeconds / currentItem.track.metadata.duration
    : 0

  const [volume, setVolume] = useLocalStorageState(
    "volume",
    0.5,
    useMemo(() => z.number(), []),
  )
  const muted = volume === 0

  const [audioPlayFailed, setAudioPlayFailed] = useState(false)
  const [audioStalled, setAudioStalled] = useState(false)

  const youTubePreview = useYouTubePreview()

  const context = trpc.useContext()

  useEffect(() => {
    const { metadata } = currentItem?.track ?? {}
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
  }, [currentItem?.track])

  const handleLiveEvent = useEffectEvent((event: VinylEvent) => {
    if (event.type !== "player-time") {
      console.debug("event received", event)
    }

    if (event.type === "player-time" && event.room === `room:${room.id}`) {
      setProgressSeconds(event.seconds)
    }

    if (event.type === "queue-advance" && event.queue === room.queue.id) {
      setCurrentItemId(event.item.id)
      if (!document.hasFocus()) {
        void showNotification({
          title: "Now playing",
          body: `${event.item.track.metadata.artist} - ${event.item.track.metadata.title}`,
        })
      }
    }

    if (event.type === "queue-update" && event.id === room.queue.id) {
      context.rooms.get.setData(
        { id: room.id },
        { ...room, queue: { ...room.queue, ...event } },
      )
    }

    if (
      event.type === "track-activation-error" &&
      event.queue === room.queue.id
    ) {
      console.warn("failed to activate track", event.track)
      // todo actual error i guess
    }

    if (
      event.type === "user-entered-room" &&
      event.room === `room:${room.id}`
    ) {
      context.rooms.get.setData(
        { id: room.id },
        { ...room, connections: [...room.connections, event.user] },
      )
    }

    if (event.type === "user-left-room" && event.room === `room:${room.id}`) {
      context.rooms.get.setData(
        { id: room.id },
        {
          ...room,
          connections: room.connections.filter((c) => c.id !== event.user),
        },
      )
    }
  })

  useEffect(() => {
    const source = new ReconnectingEventSource(room.eventsUrl)

    source.onOpen = () => setConnected(true)
    source.onError = () => setConnected(false)
    source.onReconnected = () => setConnected(true)
    source.onMessage = ({ data }) =>
      handleLiveEvent(vinylEventSchema.parse(JSON.parse(String(data))))

    return () => source.close()
  }, [room.eventsUrl, handleLiveEvent])

  useEffect(() => {
    const audio = getAudioElement()
    if (connected && !muted) {
      let cancelled = false

      audio.src = `${room.streamUrl}&t=${Date.now()}`
      audio.play().then(
        () => {
          if (cancelled) return
          setAudioPlayFailed(false)
        },
        (error) => {
          if (cancelled) return
          console.warn("failed to play audio", error)
          setAudioPlayFailed(true)
        },
      )

      return () => {
        cancelled = true
      }
    } else {
      audio.src = ""
      audio.pause()
      setAudioPlayFailed(false)
    }
  }, [connected, muted, room.streamUrl])

  useEffect(() => {
    getAudioElement().volume = youTubePreview.open ? 0 : volume ** 2
  }, [volume, youTubePreview.open])

  useEffect(() => {
    return () => getAudioElement().pause()
  }, [])

  useEffect(() => {
    const audio = getAudioElement()
    const handleStalled = () => setAudioStalled(true)
    const handleCanPlay = () => setAudioStalled(false)

    audio.addEventListener("stalled", handleStalled)
    audio.addEventListener("playing", handleCanPlay)

    return () => {
      audio.removeEventListener("stalled", handleStalled)
      audio.removeEventListener("playing", handleCanPlay)
    }
  }, [])

  const pending = !connected || audioStalled

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
              to={$path("/rooms/:roomId", { roomId: room.id })}
              end
              className="border-b-2 border-transparent font-medium uppercase opacity-50 transition hover:border-accent-200 hover:text-accent-200 [&.active]:border-current [&.active]:opacity-100"
            >
              Queue
            </NavLink>
            <NavLink
              to={$path("/rooms/:roomId/history", { roomId: room.id })}
              className="border-b-2 border-transparent font-medium uppercase opacity-50 transition hover:border-accent-200 hover:text-accent-200 [&.active]:border-current [&.active]:opacity-100"
            >
              History
            </NavLink>
          </nav>
        </div>
        <QueueContext.Provider value={room.queue}>
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
            {pending && <Spinner />}
            {audioPlayFailed && (
              <button
                type="button"
                title="Play"
                onClick={() => {
                  setAudioPlayFailed(false)
                  getAudioElement()
                    .play()
                    .catch((error) => {
                      console.warn("failed to play audio", error)
                      setAudioPlayFailed(true)
                    })
                }}
              >
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
