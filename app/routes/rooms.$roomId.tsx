import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react"
import { ActionArgs, LoaderArgs, json, redirect } from "@vercel/remix"
import { Plus } from "lucide-react"
import { zfd } from "zod-form-data"
import { Player } from "~/components/player"
import { Nullish } from "~/helpers/types"
import { vinylApi } from "~/vinyl-api.server"

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
  const [user, rooms] = await Promise.all([api.getUser(), api.getRooms()])

  if (!user.data) {
    return redirect(`/sign-in?redirect=${request.url}`)
  }

  if (!rooms.data) {
    return json({ room: { error: rooms.error } }, 400)
  }

  const room = rooms.data.find((r) => r.id === params.roomId)
  if (!room) {
    return json({ room: { error: "Room not found" } }, 404)
  }

  return json({ room: { data: room } })
}

export async function action({ request, params }: ActionArgs) {
  const body = zfd.formData({ url: zfd.text() }).parse(await request.formData())
  const result = await vinylApi(request).submitSong(params.roomId!, body.url)
  return json({ error: result.error })
}

export default function RoomPage() {
  const { room } = useLoaderData<typeof loader>()
  const { error } = useActionData<typeof action>() ?? {}

  if ("error" in room) {
    return <p>Failed to load room: {room.error}</p>
  }

  return (
    <>
      <div className="container py-4 flex-1">
        <main className="panel border flex flex-col gap-4 p-4">
          <h1 className="text-2xl font-light">{room.data.name}</h1>
          <hr className="-mx-4 border-white/10" />
          <AddSongForm error={error} />
          <hr className="-mx-4 border-white/10" />
          <ul className="flex flex-col gap-4">
            {songs.map((song) => (
              <li key={song.id} className="flex flex-row gap-3">
                <div className="w-12 h-12 bg-accent-400" />
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
      <Player />
    </>
  )
}

function AddSongForm({ error }: { error: Nullish<string> }) {
  const navigation = useNavigation()
  const pending = navigation.state === "submitting"
  return (
    <Form method="POST" className="flex flex-col gap-3">
      <div className="flex flex-row gap-2">
        <input
          name="url"
          placeholder="Stream URL"
          className="bg-transparent/50 flex-1 px-3 py-2 border border-white/10 min-w-0"
        />
        <button
          data-pending={pending || undefined}
          className="flex items-center gap-2 p-2 border border-white/10 data-[pending]:opacity-50"
        >
          {pending ? "Submitting..." : <Plus />}
        </button>
      </div>
      {!pending && error ? (
        <p className="text-error-400 text-sm">{error}</p>
      ) : null}
    </Form>
  )
}
