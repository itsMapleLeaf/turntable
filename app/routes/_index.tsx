import { Link } from "@remix-run/react"
import { Disc } from "lucide-react"
import { AuthGuard } from "~/components/auth-guard"
import { Button } from "~/components/button"
import { QueryResult } from "~/components/query-result"
import { type Room } from "~/data/vinyl-types"
import { trpc } from "~/trpc/client"

export default function RoomListPage() {
  const roomsQuery = trpc.rooms.list.useQuery()
  return (
    <main className="container flex-1 flex-col p-4">
      <AuthGuard>
        <QueryResult
          query={roomsQuery}
          loadingText="Loading rooms..."
          errorPrefix="Failed to load rooms"
          render={(rooms) =>
            rooms.length === 0 ? (
              <p>No rooms found.</p>
            ) : (
              <RoomList rooms={rooms} />
            )
          }
        />
      </AuthGuard>
    </main>
  )
}

function RoomList({ rooms }: { rooms: Room[] }) {
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

// TODO: use this when creating rooms doesn't break vinyl
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function RoomListEmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <p className="text-2xl font-light">No rooms found.</p>
      <Button element={<Link to="/rooms/new" />} label="Create one!" />
    </div>
  )
}
