import { useFetcher } from "@remix-run/react"
import { type ActionArgs, json } from "@vercel/remix"
import { useEffect, useState } from "react"
import { $params, $path } from "remix-routes"
import { type Video } from "scraper-edge"
import { Spinner } from "src/components/spinner"
import { zfd } from "zod-form-data"
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

export function AddSongForm({ roomId }: { roomId: string }) {
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
      <div className="grid gap-3 p-3">
        <div className="relative">
          <input
            name="url"
            placeholder="Search YouTube"
            className="input h-full"
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
        <p>
          Or{" "}
          <button
            type="button"
            className="text-accent-200 underline underline-offset-[3px] hover:no-underline"
            onClick={() => {
              const url = prompt("Enter a YouTube or WaveDistrict URL")
              if (url) trackSubmitFetcher.submit(url)
            }}
          >
            submit a URL directly
          </button>
        </p>
      </div>
      {searchItems.length > 0 && (
        <div className="max-h-80 overflow-y-scroll">
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
      <input type="hidden" name="url" value={video.link} />
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
          className="aspect-square w-12 rounded border border-white/10 object-cover"
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
