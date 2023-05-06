import { Link, useLoaderData } from "@remix-run/react"
import { LoaderArgs, json, redirect } from "@vercel/remix"
import { Disc } from "lucide-react"
import { vinylApi } from "~/vinyl-api.server"

export async function loader({ request }: LoaderArgs) {
  const api = vinylApi(request)
  const [user, rooms] = await Promise.all([api.getUser(), api.getRooms()])
  return user.data ? json({ rooms }) : redirect("/sign-in")
}

export default function RoomListPage() {
  const { rooms } = useLoaderData<typeof loader>()
  return (
    <main className="flex-1 flex-col p-4 container">
      {"data" in rooms ? (
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
      ) : (
        <p className="text-center">{rooms.error}</p>
      )}
    </main>
  )
}
