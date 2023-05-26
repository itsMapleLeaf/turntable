import * as Popover from "@radix-ui/react-popover"
import { useFetcher } from "@remix-run/react"
import { json, type ActionArgs } from "@vercel/remix"
import { Plus } from "lucide-react"
import { useRef, useState } from "react"
import { type Video } from "scraper-edge"
import { zfd } from "zod-form-data"
import { Button } from "~/components/button"
import { Spinner } from "~/components/spinner"
import { vinylApi } from "~/data/vinyl-api.server"
import { raise } from "~/helpers/raise"
import { useDebouncedValue } from "~/helpers/use-debounced-value"
import { useRect } from "~/helpers/use-rect"
import { useSearchFetcher, type SearchFetcher } from "~/routes/search"

export async function action({ request, params }: ActionArgs) {
  const body = zfd.formData({ url: zfd.text() }).parse(await request.formData())
  const result = await vinylApi(request).submitSong(
    params.roomId ?? raise("roomId not defined"),
    body.url,
  )
  return json({ error: result.error })
}

export function AddSongForm({ roomId }: { roomId: string }) {
  const [searchInput, setSearchInput] = useState("")
  const debouncedSearchInput = useDebouncedValue(searchInput, 500)

  const trackSubmitFetcher = useFetcher<typeof action>()
  const trackSubmitPending = trackSubmitFetcher.state === "submitting"

  const searchFetcher = useSearchFetcher(debouncedSearchInput)

  const anchorRef = useRef<HTMLDivElement | null>(null)
  const anchorRect = useRect(anchorRef)

  const [popoverOpen, setPopoverOpen] = useState(false)

  return (
    <trackSubmitFetcher.Form
      method="POST"
      action={`/rooms/${roomId}/submit`}
      className="divide-y divide-white/10"
    >
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
                  roomId={roomId}
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
  roomId,
  query,
  fetcher,
}: {
  roomId: string
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
          <SearchResultItem roomId={roomId} video={video} />
        </li>
      ))}
    </ul>
  )
}

function SearchResultItem({ roomId, video }: { roomId: string; video: Video }) {
  const fetcher = useFetcher<typeof action>()
  const pending = fetcher.state === "submitting"

  return (
    <button
      type="button"
      className="button flex w-full items-center gap-3 rounded-none border-0 text-left ring-inset"
      disabled={fetcher.state === "submitting"}
      onClick={() => {
        fetcher.submit(
          { url: video.link },
          { action: `/rooms/${roomId}/submit`, method: "POST" },
        )
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
