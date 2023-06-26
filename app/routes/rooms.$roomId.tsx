import { defer, type LoaderArgs } from "@remix-run/node"
import { Await, NavLink, Outlet, useLoaderData } from "@remix-run/react"
import { $path } from "remix-routes"
import { Player } from "~/components/player"
import { Spinner } from "~/components/spinner"
import { vinylApi } from "~/data/vinyl-api.server"
import { getSessionToken } from "~/data/vinyl-session"
import { type Room } from "~/data/vinyl-types"
import { raise } from "~/helpers/errors"
import { NowPlaying } from "../components/now-playing"
import { ProgressBar } from "../components/progress-bar"
import { RoomMembers } from "../components/room-members"
import { RoomStateProvider, useRoomConnected } from "../components/room-state-context"

export function loader({ request, params }: LoaderArgs) {
  const roomId = params.roomId ?? raise("roomId not defined")
  const api = vinylApi(request)

  async function loadData() {
    const token = await getSessionToken(request)
    if (!token) return null

    const [room, queue] = await Promise.all([
      api.getRoom(roomId),
      api.getRoomQueue(roomId),
    ])

    return {
      room,
      queue,
      streamUrl: api.getRoomStreamUrl(roomId, token).href,
      socketUrl: api.getGatewayUrl(token).href,
    }
  }

  return defer({
    data: loadData(),
  })
}

export default function RoomPage() {
  const { data } = useLoaderData<typeof loader>()
  return (
    <Await resolve={data}>
      {data =>
        data
          ? (
            <RoomStateProvider room={data.room} queue={data.queue} socketUrl={data.socketUrl}>
              <RoomPageContent room={data.room} streamUrl={data.streamUrl} />
            </RoomStateProvider>
          )
          : <p>Not logged in</p>}
    </Await>
  )
}

function RoomPageContent({ room, streamUrl }: { room: Room; streamUrl: string }) {
  const connected = useRoomConnected()
  const roomId = room.id
  return (
    <>
      <main className="container grid flex-1 content-start gap-4 py-4">
        <div className="panel flex flex-col gap-3 p-3">
          <header className="flex flex-wrap items-center">
            <h1 className="flex-1 text-2xl font-light">{room.name}</h1>
            <RoomMembers />
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
