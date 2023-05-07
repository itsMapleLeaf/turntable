import { Link, useLoaderData } from "@remix-run/react"
import { LoaderArgs, json, redirect } from "@vercel/remix"
import { Disc } from "lucide-react"
import { vinylApi } from "~/vinyl-api.server"

export async function loader({ request }: LoaderArgs) {
  const api = vinylApi(request)
  const [user, rooms] = await Promise.all([api.getUser(), api.getRooms()])
  return user.data
    ? json({ rooms })
    : redirect(`/sign-in?redirect=${request.url}`)
}

export default function RoomListPage() {
  return (
    <main className="flex-1 flex-col p-4 container">
      <RoomListPageContent />
    </main>
  )
}

function RoomListPageContent() {
  const { rooms } = useLoaderData<typeof loader>()

  if ("error" in rooms) {
    return <p className="text-center">{rooms.error}</p>
  }

  if (!rooms.data.length) {
    return (
      <div className="flex flex-col items-center gap-4 text-center py-16">
        <p className="text-2xl font-light">No rooms found.</p>
        <Link to="/rooms/new" className="button">
          Create one!
        </Link>
      </div>
    )
  }

  return (
    <ul className="gap-4 grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))]">
      {rooms.data.map((room) => (
        <li key={room.id}>
          <Link
            to={`/rooms/${room.id}`}
            className="panel panel-interactive p-4 flex flex-row items-center gap-4 border"
          >
            <Disc size={32} aria-hidden />
            <span className="text-lg/5">
              {room.name}
              <br />
              <span className="text-sm opacity-75">
                {room.connections.length} listener
                {room.connections.length === 1 ? "" : "s"}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
