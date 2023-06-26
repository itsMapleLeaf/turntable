import { defer, type LoaderArgs } from "@remix-run/node"
import { Await, Link, useLoaderData } from "@remix-run/react"
import { Disc } from "lucide-react"
import { Button } from "~/components/button"
import { vinylApi } from "~/data/vinyl-api.server"
import { type Room } from "~/data/vinyl-types"

export function loader({ request }: LoaderArgs) {
  const api = vinylApi(request)
  return defer({ rooms: api.getRooms() })
}

export default function RoomListPage() {
  const { rooms } = useLoaderData<typeof loader>()
  return (
    <main className="container flex-1 flex-col p-4">
      <Await resolve={rooms} errorElement={<p>Failed to fetch rooms</p>}>
        {rooms => <RoomListPageContent rooms={rooms} />}
      </Await>
    </main>
  )
}

function RoomListPageContent({ rooms }: { rooms: Room[] }) {
  if (rooms.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-2xl font-light">No rooms found.</p>
        <Button element={<Link to="/rooms/new" />} label="Create one!" />
      </div>
    )
  }

  return (
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-4">
      {rooms.map((room) => (
        <li key={room.id}>
          <Link
            to={`/rooms/${room.id}`}
            className="panel panel-interactive flex flex-row items-center gap-4 border p-4"
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
