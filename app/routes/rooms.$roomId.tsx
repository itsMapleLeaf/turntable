import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react"
import { json, redirect, type ActionArgs, type LoaderArgs } from "@vercel/remix"
import { PlayCircle, Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { zfd } from "zod-form-data"
import { raise } from "~/helpers/raise"
import { vinylApi, type Room } from "~/vinyl-api.server"

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

  const [user, room] = await Promise.all([
    api.getUser(),
    api.getRoom(params.roomId ?? raise("roomId not defined")),
  ])

  if (!user.data) {
    return redirect(`/sign-in?redirect=${request.url}`)
  }

  return json({ room })
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
  const [playing, setPlaying] = useState(false)
  const [audio, setAudio] = useState<HTMLAudioElement>()
  const [volume, setVolume] = useState(0.5)

  useEffect(() => {
    if (playing) {
      const audio = new Audio(`/rooms/${room.id}/stream`)

      audio
        .play()
        .then(() => setAudio(audio))
        .catch((error) => {
          console.error("Failed to play audio:", error)
          setPlaying(false)
        })

      audio.addEventListener("ended", () => {
        setPlaying(false)
      })

      return () => {
        audio.src = ""
        setAudio(undefined)
      }
    } else {
      setAudio(undefined)
    }
  }, [playing, room.id])

  useEffect(() => {
    setPlaying(true)
  }, [room.id])

  useEffect(() => {
    if (audio) {
      audio.volume = volume ** 2
    }
  }, [audio, volume])

  return (
    <>
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
                  <h2 className="text-lg font-light">{song.title}</h2>
                  <p className="text-sm text-gray-400">
                    Added by {song.addedBy}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </main>
      </div>

      <footer className="panel sticky bottom-0 border-t p-4">
        <div className="container flex items-center">
          {playing ? (
            <input
              type="range"
              className="flex-1"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(event) => setVolume(event.currentTarget.valueAsNumber)}
            />
          ) : (
            <button onClick={() => setPlaying(true)}>
              <PlayCircle aria-hidden className="h-8 w-8" />
              <span className="sr-only">Play</span>
            </button>
          )}
          <p className="flex flex-1 flex-row justify-end leading-5">
            <span className="text-sm opacity-75">Now playing</span>
            <br />
            Something
          </p>
        </div>
      </footer>
    </>
  )
}

function AddSongForm() {
  const { error } = useActionData<typeof action>() ?? {}
  const navigation = useNavigation()
  const pending = navigation.state === "submitting"
  return (
    <Form method="POST" className="flex flex-col gap-3">
      <div className="flex flex-row gap-2">
        <input
          name="url"
          placeholder="Stream URL"
          className="min-w-0 flex-1 border border-white/10 bg-transparent/50 px-3 py-2"
        />
        <button
          data-pending={pending || undefined}
          className="flex items-center gap-2 border border-white/10 p-2 data-[pending]:opacity-50"
        >
          {pending ? "Submitting..." : <Plus />}
        </button>
      </div>
      {!pending && error ? (
        <p className="text-sm text-error-400">{error}</p>
      ) : null}
    </Form>
  )
}
