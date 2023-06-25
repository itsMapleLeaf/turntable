import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { useFetcher } from "@remix-run/react"
import { type ActionArgs, json } from "@vercel/remix"
import { LucideLink, LucidePlay, LucideYoutube } from "lucide-react"
import { type ReactNode, useEffect, useState } from "react"
import { $params, $path } from "remix-routes"
import { type Video } from "scraper-edge"
import { zfd } from "zod-form-data"
import { Button } from "~/components/button"
import { Spinner } from "~/components/spinner"
import { vinylApi } from "~/data/vinyl-api.server"
import { mod } from "~/helpers/math"
import { useSearchFetcher } from "~/routes/search"

export async function action({ request, params }: ActionArgs) {
  const { roomId } = $params("/rooms/:roomId/submit", params)
  const body = zfd.formData({ url: zfd.text() }).parse(await request.formData())
  const result = await vinylApi(request).submitSong(roomId, body.url)
  return json({ error: result.error })
}

function useTrackSubmitFetcher({ roomId }: { roomId: string }) {
  const { data, state, submit: baseSubmit } = useFetcher<typeof action>()
  const pending = state === "submitting"

  // cringe
  useEffect(() => {
    if (!pending && data?.error) alert(`Failed to submit song: ${data.error}`)
  }, [data?.error, pending])

  const submit = (url: string) => {
    if (pending) return
    baseSubmit(
      { url },
      { action: $path("/rooms/:roomId/submit", { roomId }), method: "POST" },
    )
  }

  return { data, pending, submit }
}

const submitSources = [
  { name: "YouTube", icon: LucideYoutube },
  { name: "Direct URL", icon: LucideLink },
] as const
type SubmitSource = typeof submitSources[number]

export function AddSongForm({ roomId }: { roomId: string }) {
  const [submitSource, setSubmitSource] = useState<SubmitSource>(submitSources[0])

  const sourceMenu = (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger type="button" className="button p-2" title="Switch source...">
        <submitSource.icon />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="border rounded-md panel overflow-clip min-w-40"
          align="end"
          sideOffset={8}
        >
          {submitSources.map((source) => (
            <DropdownMenu.Item
              key={source.name}
              className="flex items-center gap-2 py-2 px-3 data-[highlighted]:bg-white/25 transition-colors cursor-pointer"
              onClick={() => setSubmitSource(source)}
            >
              <source.icon className="w-4 h-4" /> {source.name}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )

  return submitSource.name === "YouTube"
    ? <YouTubeSearchSubmitter roomId={roomId} sourceMenu={sourceMenu} />
    : <DirectUrlSubmitter roomId={roomId} sourceMenu={sourceMenu} />
}

function DirectUrlSubmitter({ roomId, sourceMenu }: { roomId: string; sourceMenu: ReactNode }) {
  const trackSubmitFetcher = useTrackSubmitFetcher({ roomId })
  return (
    <form
      className="flex flex-row gap-2 p-3"
      onSubmit={event => {
        event.preventDefault()
        const form = new FormData(event.currentTarget)
        trackSubmitFetcher.submit(form.get("url") as string)
      }}
    >
      <input
        name="url"
        required
        placeholder="Enter a YouTube or WaveDistrict URL"
        className="input flex-1"
      />
      <Button
        element={<button type="submit" />}
        label={<span className="sr-only sm:not-sr-only">Submit</span>}
        pendingLabel={<span className="sr-only sm:not-sr-only">Submitting...</span>}
        pending={trackSubmitFetcher.pending}
        iconElement={<LucidePlay />}
      />
      {sourceMenu}
    </form>
  )
}

function YouTubeSearchSubmitter({ roomId, sourceMenu }: {
  roomId: string
  sourceMenu: ReactNode
}) {
  const searchFetcher = useSearchFetcher()
  const searchItems = searchFetcher.data?.data ?? []
  const [searchInputEmpty, setSearchInputEmpty] = useState(true)
  const trackSubmitFetcher = useTrackSubmitFetcher({ roomId })

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      className="divide-y divide-white/10"
      onKeyDown={(event) => {
        const targets = event.currentTarget.querySelectorAll<HTMLElement>(
          "[data-focus-target]",
        )
        const index = [...targets].indexOf(event.target as HTMLElement)

        if (event.key === "ArrowDown") {
          event.preventDefault()
          targets[mod(index + 1, targets.length)]?.focus()
        }

        if (event.key === "ArrowUp") {
          event.preventDefault()
          targets[mod(index - 1, targets.length)]?.focus()
        }

        if (event.key === "Home") {
          event.preventDefault()
          targets[0]?.focus()
        }
      }}
    >
      <div className="flex flex-row gap-2 p-3">
        <div className="relative flex-1">
          <input
            name="url"
            placeholder="Search YouTube"
            className="h-full input"
            required
            data-focus-target
            onChange={(event) => {
              searchFetcher.load(event.target.value)
              setSearchInputEmpty(event.target.value.trim() === "")
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault()
                document
                  .querySelector<HTMLElement>("[data-search-result-item]")
                  ?.click()
              }
            }}
          />
          <div
            data-visible={searchFetcher.state === "loading"
              || trackSubmitFetcher.pending
              || undefined}
            className="pointer-events-none absolute inset-y-0 right-0 flex items-center justify-center px-3 opacity-0 transition-opacity data-[visible]:opacity-100"
          >
            <Spinner />
          </div>
        </div>
        {sourceMenu}
      </div>

      {searchItems.length > 0 && (
        <div className="overflow-y-scroll max-h-80">
          {searchItems.map((video) => (
            <SearchResultItem key={video.id} roomId={roomId} video={video} />
          ))}
        </div>
      )}

      {searchFetcher.data?.data?.length === 0 && !searchInputEmpty && (
        <p className="p-3 opacity-75">No results found.</p>
      )}
    </div>
  )
}

function SearchResultItem({ roomId, video }: { roomId: string; video: Video }) {
  const fetcher = useTrackSubmitFetcher({ roomId })
  return (
    <>
      <button
        type="button"
        className="button flex w-full items-center gap-3 rounded-none border-none bg-transparent text-left ring-inset data-[pending]:opacity-75"
        data-pending={fetcher.pending || undefined}
        data-focus-target
        data-search-result-item
        onClick={() => fetcher.submit(video.link)}
      >
        <img
          src={video.thumbnail}
          alt=""
          className="object-cover w-12 border rounded aspect-square border-white/10"
        />
        <div className="flex-1 leading-none">
          <div className="text-sm opacity-75">
            {video.channel.name} &bull; {video.duration_raw}
          </div>
          <div>{video.title}</div>
        </div>
        <div
          data-pending={fetcher.pending || undefined}
          className="opacity-0 transition-opacity data-[pending]:opacity-100"
        >
          <Spinner />
        </div>
      </button>
    </>
  )
}
