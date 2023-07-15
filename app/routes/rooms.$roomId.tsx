import { NavLink, Outlet, useParams } from "@remix-run/react"
import { $params, $path } from "remix-routes"
import { AuthGuard } from "~/components/auth-guard"
import { Player } from "~/components/player"
import { QueryResult } from "~/components/query-result"
import { Spinner } from "~/components/spinner"
import { type Room } from "~/data/vinyl-types"
import { trpc } from "~/trpc/client"
import { NowPlaying } from "../components/now-playing"
import { ProgressBar } from "../components/progress-bar"
import { RoomMembers } from "../components/room-members"
import {
  RoomStateProvider,
  useRoomConnected,
  useRoomMembers,
} from "../components/room-state-context"

export default function RoomPage() {
  const { roomId } = $params("/rooms/:roomId", useParams())
  const roomQuery = trpc.rooms.get.useQuery({ id: roomId })
  return (
    <AuthGuard>
      <QueryResult
        query={roomQuery}
        loadingText="Loading room..."
        errorPrefix="Failed to load room"
        render={(room) => (
          <RoomStateProvider
            room={room}
            queue={room.queue}
            socketUrl={room.eventsUrl}
          >
            <RoomPageContent room={room} streamUrl={room.streamUrl} />
          </RoomStateProvider>
        )}
      />
    </AuthGuard>
  )
}

function RoomPageContent({
  room,
  streamUrl,
}: {
  room: Room
  streamUrl: string
}) {
  const connected = useRoomConnected()
  const members = useRoomMembers()
  const roomId = room.id
  return (
    <>
      <main className="container grid flex-1 content-start gap-4 py-4">
        <div className="panel flex flex-col gap-3 p-3">
          <header className="flex flex-wrap items-center">
            <h1 className="flex-1 text-2xl font-light">{room.name}</h1>
            <RoomMembers members={members} />
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
        <Outlet />
      </main>
      <footer className="panel sticky bottom-0">
        <ProgressBar />
        <div className="container flex flex-col items-center gap-4 py-4 sm:flex-row">
          {connected ? <Player streamUrl={streamUrl} /> : <Spinner />}
          <NowPlaying />
        </div>
      </footer>
    </>
  )
}
