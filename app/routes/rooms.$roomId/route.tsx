import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "@remix-run/react"
import { json, redirect, type ActionArgs, type LoaderArgs } from "@vercel/remix"
import { PlayCircle, Plus } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { zfd } from "zod-form-data"
import { Button } from "~/components/button"
import { raise } from "~/helpers/raise"
import { useSearchFetcher } from "~/routes/search"
import { vinylApi } from "~/vinyl/vinyl-api.server"
import { getSessionToken } from "~/vinyl/vinyl-session"
import { type Room } from "~/vinyl/vinyl-types"
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
    playStream(`/rooms/${room.id}/stream`)
  }, [room.id])

  useEffect(() => {
    play()
    return () => stopStream()
  }, [play])

  return (
    <RoomStateProvider room={room} socketUrl={socketUrl}>
      <div className="container flex-1 py-4">
        <main className="panel flex flex-col gap-4 border p-4">
          <div className="flex items-center">
            <h1 className="flex-1 text-2xl font-light">{room.name}</h1>
            <RoomMembers />
          </div>
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
  const { error } = useActionData<typeof action>() ?? {}

  const navigation = useNavigation()
  const pending = navigation.state === "submitting"

  const [searchInput, setSearchInput] = useState("")
  const debouncedSearchInput = useDebouncedValue(
    searchInput,
    searchInput.trim() ? 500 : 0,
  )
  const searchFetcher = useSearchFetcher(debouncedSearchInput)

  const submit = useSubmit()
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (!pending && !error) {
      formRef.current?.reset()
      setSearchInput("")
    }
  }, [error, pending])

  return (
    <Form method="POST" className="flex flex-col gap-3" ref={formRef}>
      <div className="flex flex-row gap-2">
        <input
          name="url"
          placeholder="Search or enter song URL"
          className="input"
          required
          disabled={pending}
          value={searchInput}
          onChange={(event) => setSearchInput(event.currentTarget.value)}
        />
        <Button
          pending={pending}
          label="Add"
          pendingLabel="Adding..."
          iconElement={<Plus />}
        />
      </div>

      {searchFetcher.state === "loading" && <p>Loading search results...</p>}

      {searchFetcher.state === "error" && (
        <p>Search failed: {searchFetcher.error}</p>
      )}

      {searchFetcher.state === "success" && (
        <ul className="border border-white/10 rounded-lg divide-y divide-white/10 max-h-80 overflow-y-scroll">
          {searchFetcher.data.items.map((result) => (
            <li key={result.id.videoId}>
              <button
                type="button"
                className="button border-0 rounded-none w-full flex items-center gap-2 text-left"
                onClick={() => {
                  submit(
                    { url: `https://youtube.com/watch?v=${result.id.videoId}` },
                    { method: "POST" },
                  )
                }}
              >
                <img
                  src={result.snippet.thumbnails.default.url}
                  alt=""
                  className="w-12 aspect-square object-cover"
                />
                <span
                  dangerouslySetInnerHTML={{
                    __html: `${result.snippet.title} by ${result.snippet.channelTitle}`,
                  }}
                />
              </button>
            </li>
          ))}
        </ul>
      )}

      {!pending && error ? (
        <p className="text-sm text-error-400">{error}</p>
      ) : null}
    </Form>
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
