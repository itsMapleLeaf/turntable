import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react"
import { json, redirect, type ActionArgs, type LoaderArgs } from "@vercel/remix"
import { PlayCircle, Plus } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { z } from "zod"
import { zfd } from "zod-form-data"
import { Button } from "~/components/button"
import { raise } from "~/helpers/raise"
import { vinylApi, type Room } from "~/vinyl-api.server"
import { getSessionToken } from "~/vinyl-session"

const songs = [
  { id: "1", title: "Song 1", addedBy: "User 1" },
  { id: "2", title: "Song 2", addedBy: "User 2" },
  { id: "3", title: "Song 3", addedBy: "User 3" },
  { id: "4", title: "Song 4", addedBy: "User 4" },
  { id: "5", title: "Song 5", addedBy: "User 5" },
  { id: "6", title: "Song 6", addedBy: "User 6" },
]

export async function loader({ request, params }: LoaderArgs) {
  const api = vinylApi(request)

  const [user, room, token] = await Promise.all([
    api.getUser(),
    api.getRoom(params.roomId ?? raise("roomId not defined")),
    getSessionToken(request),
  ])

  if (!user.data || !token) {
    return redirect(`/sign-in?redirect=${request.url}`)
  }

  return json({
    room,
    socketUrl: new URL(
      `/v1/gateway?token=${token}`,
      process.env.VINYL_SOCKET_URL ?? raise("VINYL_SOCKET_URL is not defined"),
    ).href,
  })
}

export async function action({ request, params }: ActionArgs) {
  const body = zfd.formData({ url: zfd.text() }).parse(await request.formData())
  const result = await vinylApi(request).submitSong(
    params.roomId ?? raise("roomId not defined"),
    body.url,
  )
  return json({ error: result.error })
}

export default function RoomPage() {
  const { room } = useLoaderData<typeof loader>()
  if ("error" in room) {
    return <p>Failed to load room: {room.error}</p>
  }
  return <RoomPageContent room={room.data} />
}

function RoomPageContent({ room }: { room: Room }) {
  const [audio, setAudio] = useState<HTMLAudioElement | null>()
  return (
    <>
      <audio
        src={`/rooms/${room.id}/stream`}
        autoPlay
        key={room.id}
        ref={setAudio}
      />

      <div className="container flex-1 py-4">
        <main className="panel flex flex-col gap-4 border p-4">
          <h1 className="text-2xl font-light">{room.name}</h1>
          <hr className="-mx-4 border-white/10" />
          <AddSongForm />
          <hr className="-mx-4 border-white/10" />
          <ul className="flex flex-col gap-4">
            {songs.map((song) => (
              <li key={song.id} className="flex flex-row gap-3">
                <div className="h-12 w-12 bg-accent-400" />
                <div className="flex-1 leading-5">
                  <h2 className="text-lg font-light">
                    SongListItemTitleContent
                  </h2>
                  <p className="text-sm text-gray-400">
                    SongListItemAddedByContent
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </main>
      </div>

      <footer
        data-visible={!!audio || undefined}
        className="translate-y-full transition data-[visible]:translate-y-0"
      >
        {audio && <Player audio={audio} />}
      </footer>
    </>
  )
}

type RoomState = {
  track?: { title: string; duration: number }
  songProgress: number
}

function Player({ audio }: { audio: HTMLAudioElement }) {
  const [playing, setPlaying] = useState(false)
  useEffect(() => {
    const handlePlay = () => setPlaying(true)
    const handlePause = () => setPlaying(false)

    audio.addEventListener("play", handlePlay)
    audio.addEventListener("pause", handlePause)

    return () => {
      audio.removeEventListener("play", handlePlay)
      audio.removeEventListener("pause", handlePause)
    }
  }, [audio])

  const { socketUrl } = useLoaderData<typeof loader>()
  const [roomState, setRoomState] = useState<RoomState>({
    songProgress: 0,
  })

  useEffect(() => {
    const socketMessageSchema = z.union([
      z.object({
        type: z.literal("player-time"),
        seconds: z.number(),
      }),
      z.object({
        type: z.literal("track-update"),
        track: z.object({
          title: z.string(),
          duration: z.number(),
        }),
      }),
    ])

    let socket: WebSocket | undefined

    function connect() {
      socket = new WebSocket(socketUrl)
      socket.addEventListener("message", handleMessage)
      socket.addEventListener("close", handleClose)
      socket.addEventListener("error", handleError)
    }

    function handleMessage(event: MessageEvent) {
      try {
        const result = socketMessageSchema.safeParse(
          JSON.parse(event.data as string),
        )

        if (!result.success) {
          console.error("Unknown socket message:", result.error)
          return
        }

        if (result.data.type === "track-update") {
          const { track } = result.data
          setRoomState((state) => ({ ...state, track, songProgress: 0 }))
        }

        if (result.data.type === "player-time") {
          const { seconds } = result.data
          setRoomState((state) => ({ ...state, songProgress: seconds }))
        }
      } catch (error) {
        console.error("Failed to parse socket message:", error)
      }
    }

    function handleClose() {
      setTimeout(connect, 1000)
    }

    function handleError() {
      setTimeout(connect, 1000)
    }

    connect()

    return () => {
      socket?.removeEventListener("message", handleMessage)
      socket?.removeEventListener("close", handleClose)
      socket?.removeEventListener("error", handleError)
      socket?.close()
    }
  }, [socketUrl])

  const progress = roomState.songProgress / (roomState.track?.duration ?? 180)

  return (
    <footer className="panel sticky bottom-0 overflow-clip">
      <div className="relative h-px w-full bg-white/25">
        <div
          className="h-full origin-left bg-accent-300"
          style={{ transform: `scaleX(${progress})` }}
        />
        <div
          className="top-full h-3 origin-left bg-gradient-to-b from-accent-400/30 via-accent-400/10"
          style={{ transform: `scaleX(${progress})` }}
        />
      </div>

      <div className="container flex flex-col items-center gap-4 py-4 sm:flex-row">
        {playing && audio ? (
          <VolumeSlider audio={audio} />
        ) : (
          <button
            type="button"
            onClick={() => {
              audio?.play().catch((error) => {
                console.error("Failed to play audio:", error)
              })
            }}
          >
            <PlayCircle aria-hidden className="h-8 w-8" />
            <span className="sr-only">Play</span>
          </button>
        )}

        <div className="flex flex-1 flex-col text-center leading-5 sm:text-right">
          {roomState.track ? (
            <>
              <p className="text-sm opacity-75">Now playing</p>
              <p>{roomState.track.title}</p>
            </>
          ) : (
            <p className="opacity-75">Nothing playing</p>
          )}
        </div>
      </div>
    </footer>
  )
}

function VolumeSlider({ audio }: { audio: HTMLAudioElement }) {
  const [volume, setVolume] = useState(0.5)

  useEffect(() => {
    const storedVolume = localStorage.getItem("volume")
    if (!storedVolume) return

    const storedVolumeNumber = Number(storedVolume)
    if (!Number.isFinite(storedVolumeNumber)) return

    setVolume(storedVolumeNumber)
  }, [])

  function handleVolumeChange(event: React.ChangeEvent<HTMLInputElement>) {
    const newVolume = event.currentTarget.valueAsNumber
    setVolume(newVolume)
    localStorage.setItem("volume", String(newVolume))
  }

  useEffect(() => {
    audio.volume = volume ** 2
  }, [audio, volume])

  return (
    <input
      type="range"
      className="w-48"
      min={0}
      max={1}
      step={0.01}
      value={volume}
      onChange={handleVolumeChange}
    />
  )
}

function AddSongForm() {
  const { error } = useActionData<typeof action>() ?? {}
  const navigation = useNavigation()
  const pending = navigation.state === "submitting"
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (!pending && !error) {
      formRef.current?.reset()
    }
  }, [error, pending])

  return (
    <Form method="POST" className="flex flex-col gap-3" ref={formRef}>
      <div className="flex flex-row gap-2">
        <input name="url" placeholder="Stream URL" className="input" required />
        <Button
          pending={pending}
          label="Add"
          pendingLabel="Adding..."
          iconElement={<Plus />}
        />
      </div>
      {!pending && error ? (
        <p className="text-sm text-error-400">{error}</p>
      ) : null}
    </Form>
  )
}
