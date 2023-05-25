import * as Popover from "@radix-ui/react-popover"
import { useFetcher, useLoaderData } from "@remix-run/react"
import { json, redirect, type ActionArgs, type LoaderArgs } from "@vercel/remix"
import { Plus } from "lucide-react"
import { useEffect, useRef, useState, type RefObject } from "react"
import { type Video } from "scraper-edge"
import { zfd } from "zod-form-data"
import { Button } from "~/components/button"
import { Player } from "~/components/player"
import { Spinner } from "~/components/spinner"
import { vinylApi } from "~/data/vinyl-api.server"
import { getSessionToken } from "~/data/vinyl-session"
import { type Room } from "~/data/vinyl-types"
import { raise } from "~/helpers/raise"
import { useSearchFetcher, type SearchFetcher } from "~/routes/search"
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

export async function action({ request, params }: ActionArgs) {
  const body = zfd.formData({ url: zfd.text() }).parse(await request.formData())
  const result = await vinylApi(request).submitSong(
    params.roomId ?? raise("roomId not defined"),
    body.url,
  )
  return json({ error: result.error })
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
          <AddSongForm />
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

function AddSongForm() {
  const [searchInput, setSearchInput] = useState("")
  const debouncedSearchInput = useDebouncedValue(searchInput, 500)

  const trackSubmitFetcher = useFetcher<typeof action>()
  const trackSubmitPending = trackSubmitFetcher.state === "submitting"

  const searchFetcher = useSearchFetcher(debouncedSearchInput)

  const anchorRef = useRef<HTMLDivElement | null>(null)
  const anchorRect = useRect(anchorRef)

  const [popoverOpen, setPopoverOpen] = useState(false)

  return (
    <trackSubmitFetcher.Form method="POST" className="divide-y divide-white/10">
      <Popover.Root open={popoverOpen} onOpenChange={setPopoverOpen}>
        <Popover.Anchor className="flex flex-row gap-2 p-3" ref={anchorRef}>
          <div className="relative flex-1">
            <input
              name="url"
              placeholder="Search or enter song URL"
              className="input h-full"
              required
              disabled={trackSubmitPending}
              value={searchInput}
              onChange={(event) => setSearchInput(event.currentTarget.value)}
              // dumb hacks to keep the results open while the input is focused
              onFocus={() => {
                setPopoverOpen(true)
              }}
              onMouseDown={() => {
                requestAnimationFrame(() => {
                  setPopoverOpen(true)
                })
              }}
            />
            <div
              data-visible={
                searchFetcher.state === "loading" ||
                trackSubmitPending ||
                undefined
              }
              className="pointer-events-none absolute inset-y-0 right-0 flex items-center justify-center px-3 opacity-0 transition-opacity data-[visible]:opacity-100"
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
        </Popover.Anchor>

        <Popover.Portal>
          <Popover.Content
            className="panel border"
            align="start"
            forceMount
            onOpenAutoFocus={(event) => event.preventDefault()}
          >
            <div style={{ width: anchorRect?.width }}>
              {debouncedSearchInput && (
                <SearchResults
                  query={debouncedSearchInput}
                  fetcher={searchFetcher}
                />
              )}
            </div>
          </Popover.Content>
        </Popover.Portal>

        {!trackSubmitPending && trackSubmitFetcher.data?.error ? (
          <p className="text-sm text-error-400">
            {trackSubmitFetcher.data?.error}
          </p>
        ) : null}
      </Popover.Root>
    </trackSubmitFetcher.Form>
  )
}

function SearchResults({
  query,
  fetcher,
}: {
  query: string
  fetcher: SearchFetcher
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
    <ul className="max-h-80 divide-y divide-white/10 overflow-y-scroll">
      {fetcher.data.data.map((video) => (
        <li key={video.id}>
          <SearchResultItem video={video} />
        </li>
      ))}
    </ul>
  )
}

function SearchResultItem({ video }: { video: Video }) {
  const fetcher = useFetcher<typeof action>()
  const pending = fetcher.state === "submitting"

  return (
    <button
      type="button"
      className="button flex w-full items-center gap-3 rounded-none border-0 text-left ring-inset"
      disabled={fetcher.state === "submitting"}
      onClick={() => {
        fetcher.submit({ url: video.link }, { method: "POST" })
      }}
    >
      <img
        src={video.thumbnail}
        alt=""
        className="aspect-square w-12 rounded border border-white/10 object-cover"
      />
      <div className="flex-1 leading-none">
        <div className="text-sm opacity-75">
          {video.channel.name} &bull; {video.duration_raw}
        </div>
        <div>{video.title}</div>
      </div>
      {pending && <Spinner />}
    </button>
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

function useRect(ref: RefObject<HTMLElement>) {
  const [rect, setRect] = useState<DOMRect>()

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new ResizeObserver(([info]) => {
      if (info) setRect(info.target.getBoundingClientRect())
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref])

  return rect
}
