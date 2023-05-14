import * as Popover from "@radix-ui/react-popover"
import { useFetcher, useLoaderData } from "@remix-run/react"
import { json, redirect, type ActionArgs, type LoaderArgs } from "@vercel/remix"
import { PlayCircle, Plus } from "lucide-react"
import { useCallback, useEffect, useRef, useState, type RefObject } from "react"
import { zfd } from "zod-form-data"
import { Button } from "~/components/button"
import { Spinner } from "~/components/spinner"
import { vinylApi } from "~/data/vinyl-api.server"
import { getSessionToken } from "~/data/vinyl-session"
import { type Queue, type Room } from "~/data/vinyl-types"
import { raise } from "~/helpers/raise"
import { useSearchFetcher, type SearchFetcher } from "~/routes/search"
import { NowPlaying } from "./now-playing"
import { ProgressBar } from "./progress-bar"
import { RoomMembers } from "./room-members"
import { RoomQueue } from "./room-queue"
import { RoomStateProvider } from "./room-state-context"
import { playStream, stopStream, useStreamPlaying } from "./stream-audio"
import { VolumeSlider } from "./volume-slider"

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
  const { room, queue } = useLoaderData<typeof loader>()
  if ("error" in room) {
    return <p>Failed to load room: {room.error}</p>
  }
  if ("error" in queue) {
    return <p>Failed to load queue: {queue.error}</p>
  }
  return <RoomPageContent room={room.data} queue={queue.data} />
}

function RoomPageContent({ room, queue }: { room: Room; queue: Queue }) {
  const { socketUrl, streamUrl } = useLoaderData<typeof loader>()
  const playing = useStreamPlaying()

  const play = useCallback(() => {
    playStream(`${streamUrl}&nocache=${Date.now()}`)
  }, [streamUrl])

  useEffect(() => {
    play()
    return () => stopStream()
  }, [play])

  return (
    <RoomStateProvider room={room} queue={queue} socketUrl={socketUrl}>
      <main className="container flex-1 py-4 grid gap-4 content-start isolate">
        <section className="panel flex flex-col border divide-y divide-white/10 sticky top-20 z-10">
          <div className="flex items-center p-4">
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

  const anchorRef = useRef<HTMLDivElement | null>(null)
  const anchorRect = useRect(anchorRef)

  const [popoverOpen, setPopoverOpen] = useState(false)

  return (
    <trackSubmitFetcher.Form method="POST" className="divide-y divide-white/10">
      <Popover.Root open={popoverOpen} onOpenChange={setPopoverOpen}>
        <Popover.Anchor className="flex flex-row gap-2 p-3" ref={anchorRef}>
          <div className="flex-1 relative">
            <input
              name="url"
              placeholder="Search or enter song URL"
              className="input h-full"
              required
              disabled={trackSubmitPending}
              value={searchInput}
              onChange={(event) => setSearchInput(event.currentTarget.value)}
              onFocus={(event) => {
                event.currentTarget.select()
                setPopoverOpen(true)
              }}
              onMouseDown={(event) => {
                event.currentTarget.select()
                setPopoverOpen(true)
              }}
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
                  onSubmit={(url) => {
                    trackSubmitFetcher.submit({ url }, { method: "POST" })
                  }}
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
