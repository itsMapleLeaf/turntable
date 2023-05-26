import { useLoaderData } from "@remix-run/react"
import { json, redirect, type LoaderArgs } from "@vercel/remix"
import { Player } from "~/components/player"
import { Spinner } from "~/components/spinner"
import { vinylApi } from "~/data/vinyl-api.server"
import { getSessionToken } from "~/data/vinyl-session"
import { type Room } from "~/data/vinyl-types"
import { raise } from "~/helpers/raise"
import { AddSongForm } from "../rooms.$roomId.submit"
import { NowPlaying } from "./now-playing"
import { ProgressBar } from "./progress-bar"
import { RoomMembers } from "./room-members"
import { RoomQueue } from "./room-queue"
import { RoomStateProvider, useRoomConnected } from "./room-state-context"

export async function loader({ request, params }: LoaderArgs) {
  const roomId = params.roomId ?? raise("roomId not defined")

  const api = vinylApi(request)

  const [user, room, queue, token] = await Promise.all([
    api.getUser(),
    api.getRoom(roomId),
    api.getRoomQueue(roomId),
    getSessionToken(request),
  ])

  if (!user.data || !token) {
    return redirect(`/sign-in?redirect=${request.url}`)
  }

  return json({
    user: user.data,
    room,
    queue,
    streamUrl: api.getRoomStreamUrl(roomId, token).href,
    socketUrl: api.getGatewayUrl(token).href,
  })
}

export default function RoomPage() {
  const { room, queue, socketUrl } = useLoaderData<typeof loader>()
  if ("error" in room) {
    return <p>Failed to load room: {room.error}</p>
  }
  if ("error" in queue) {
    return <p>Failed to load queue: {queue.error}</p>
  }
  return (
    <RoomStateProvider
      room={room.data}
      queue={queue.data}
      socketUrl={socketUrl}
    >
      <RoomPageContent room={room.data} />
    </RoomStateProvider>
  )
}

function RoomPageContent({ room }: { room: Room }) {
  const connected = useRoomConnected()
  const data = useLoaderData<typeof loader>()
  return (
    <>
      <main className="container isolate grid flex-1 content-start gap-4 py-4">
        <section className="panel sticky top-20 z-10 flex flex-col divide-y divide-white/10 border">
          <div className="flex flex-wrap items-center p-4">
            <h1 className="flex-1 text-2xl font-light">{room.name}</h1>
            <RoomMembers />
          </div>
          <AddSongForm roomId={room.id} />
        </section>
        <RoomQueue />
      </main>
      <footer className="panel sticky bottom-0">
        <ProgressBar />
        <div className="container flex flex-col items-center gap-4 py-4 sm:flex-row">
          {connected ? <Player streamUrl={data.streamUrl} /> : <Spinner />}
          <NowPlaying />
        </div>
      </footer>
    </>
  )
}
