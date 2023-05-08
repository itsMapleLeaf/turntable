import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react"
import { json, redirect, type ActionArgs, type LoaderArgs } from "@vercel/remix"
import { Plus } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { zfd } from "zod-form-data"
import { Button } from "~/components/button"
import { Player } from "~/components/player"
import { raise } from "~/helpers/raise"
import { vinylApi } from "~/vinyl/vinyl-api.server"
import { getSessionToken } from "~/vinyl/vinyl-session"
import { type Room } from "~/vinyl/vinyl-types"

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
  const [audio, setAudio] = useState<HTMLAudioElement>()
  const { socketUrl } = useLoaderData<typeof loader>()

  useEffect(() => {
    const audio = new Audio(`/rooms/${room.id}/stream`)
    setAudio(audio)

    audio.play().catch((error) => {
      console.error("Failed to play audio:", error)
    })

    return () => {
      audio.pause()
      audio.src = ""
    }
  }, [room.id])

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
        {audio && <Player socketUrl={socketUrl} room={room} audio={audio} />}
      </footer>
    </>
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
