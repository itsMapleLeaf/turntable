import { useFetcher, useLoaderData } from "@remix-run/react"
import { json, redirect, type ActionArgs, type LoaderArgs } from "@vercel/remix"
import { PlayCircle, Plus } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { zfd } from "zod-form-data"
import { Button } from "~/components/button"
import { Spinner } from "~/components/spinner"
import { vinylApi } from "~/data/vinyl-api.server"
import { getSessionToken } from "~/data/vinyl-session"
import { type Room } from "~/data/vinyl-types"
import { raise } from "~/helpers/raise"
import { useSearchFetcher, type SearchFetcher } from "~/routes/search"
import { NowPlaying } from "./now-playing"
import { ProgressBar } from "./progress-bar"
import { RoomMembers } from "./room-members"
import { RoomStateProvider } from "./room-state-context"
import { playStream, stopStream, useStreamPlaying } from "./stream-audio"
import { VolumeSlider } from "./volume-slider"

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
  const { socketUrl } = useLoaderData<typeof loader>()
  const playing = useStreamPlaying()

  const play = useCallback(() => {
    playStream(`/rooms/${room.id}/stream.wav?nocache=${Date.now()}`)
  }, [room.id])

  useEffect(() => {
    play()
    return () => stopStream()
  }, [play])

  return (
    <RoomStateProvider room={room} socketUrl={socketUrl}>
      <main className="container flex-1 py-4 grid gap-4 content-start">
        <section className="panel flex flex-col border divide-y divide-white/10">
          <div className="flex items-center p-4">
            <h1 className="flex-1 text-2xl font-light">{room.name}</h1>
            <RoomMembers />
          </div>
          <AddSongForm />
        </section>

        <ul className="panel border divide-y divide-white/10">
          {songs.map((song) => (
            <li key={song.id} className="flex flex-row gap-3 p-3">
              <div className="h-12 w-12 bg-accent-400" />
              <div className="flex-1 leading-5">
                <h2 className="text-lg font-light">SongListItemTitleContent</h2>
                <p className="text-sm text-gray-400">
                  SongListItemAddedByContent
                </p>
              </div>
            </li>
          ))}
        </ul>
      </main>

      <footer className="panel sticky bottom-0">
        <ProgressBar />
        <div className="container flex flex-col items-center gap-4 py-4 sm:flex-row">
          {playing ? (
            <VolumeSlider />
          ) : (
            <button type="button" onClick={play}>
              <PlayCircle aria-hidden className="h-8 w-8" />
              <span className="sr-only">Play</span>
            </button>
          )}
          <NowPlaying />
        </div>
      </footer>
    </RoomStateProvider>
  )
}

function AddSongForm() {
  const [searchInput, setSearchInput] = useState("")
  const debouncedSearchInput = useDebouncedValue(searchInput, 500)

  const trackSubmitFetcher = useFetcher<typeof action>()
  const trackSubmitPending = trackSubmitFetcher.state === "submitting"

  const searchFetcher = useSearchFetcher(debouncedSearchInput)

  return (
    <trackSubmitFetcher.Form method="POST" className="divide-y divide-white/10">
      <div className="flex flex-row gap-2 p-3">
        <div className="flex-1 relative">
          <input
            name="url"
            placeholder="Search or enter song URL"
            className="input h-full"
            required
            disabled={trackSubmitPending}
            value={searchInput}
            onChange={(event) => setSearchInput(event.currentTarget.value)}
            onFocus={(event) => event.currentTarget.select()}
          />
          <div
            data-visible={
              searchFetcher.state === "loading" ||
              trackSubmitPending ||
              undefined
            }
            className="absolute right-0 inset-y-0 px-3 flex items-center justify-center data-[visible]:opacity-100 opacity-0 transition-opacity pointer-events-none"
          >
            <Spinner />
          </div>
        </div>
        <Button
          pending={trackSubmitPending}
          label="Add"
          pendingLabel="Adding..."
          iconElement={<Plus />}
        />
      </div>

      {debouncedSearchInput && (
        <SearchResults
          query={debouncedSearchInput}
          fetcher={searchFetcher}
          onSubmit={(url) => {
            trackSubmitFetcher.submit({ url }, { method: "POST" })
          }}
        />
      )}

      {!trackSubmitPending && trackSubmitFetcher.data?.error ? (
        <p className="text-sm text-error-400">
          {trackSubmitFetcher.data?.error}
        </p>
      ) : null}
    </trackSubmitFetcher.Form>
  )
}

function SearchResults({
  query,
  fetcher,
  onSubmit,
}: {
  query: string
  fetcher: SearchFetcher
  onSubmit: (url: string) => void
}) {
  if (
    !fetcher.data ||
    (fetcher.data.data?.length === 0 && fetcher.state === "loading")
  ) {
    return <p className="p-3">{`Loading results for "${query}"...`}</p>
  }

  if (!fetcher.data.data) {
    return <p className="p-3">{fetcher.data.error}</p>
  }

  if (fetcher.data.data.length === 0) {
    return <p className="p-3">{`No results found for "${query}"`}</p>
  }

  return (
    <ul className="divide-y divide-white/10 max-h-80 overflow-y-scroll">
      {fetcher.data.data.map((video) => (
        <li key={video.id}>
          <button
            type="button"
            className="button border-0 rounded-none w-full flex items-center gap-3 text-left ring-inset"
            disabled={fetcher.state === "submitting"}
            onClick={() => {
              onSubmit(video.link)
            }}
          >
            <img
              src={video.thumbnail}
              alt=""
              className="w-12 aspect-square object-cover border border-white/10 rounded"
            />
            <div className="leading-none">
              <div className="text-sm opacity-75">
                {video.channel.name} &bull; {video.duration_raw}
              </div>
              <div>{video.title}</div>
            </div>
          </button>
        </li>
      ))}
    </ul>
  )
}

function useDebouncedValue<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])
  return debouncedValue
}
