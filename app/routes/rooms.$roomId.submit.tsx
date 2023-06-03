import { useFetcher } from "@remix-run/react"
import { json, type ActionArgs } from "@vercel/remix"
import { useEffect } from "react"
import { $params, $path } from "remix-routes"
import { type Video } from "scraper-edge"
import { zfd } from "zod-form-data"
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

export function AddSongForm({ roomId }: { roomId: string }) {
  const searchFetcher = useSearchFetcher()
  const searchItems = searchFetcher.data?.data ?? []

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
      }}
    >
      <div className="relative p-3">
        <input
          name="url"
          placeholder="Search or paste song URL (YouTube and WaveDistrict supported)"
          className="input h-full"
          required
          data-focus-target
          onChange={(event) => searchFetcher.load(event.target.value)}
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
          data-visible={searchFetcher.state === "loading" || undefined}
          className="pointer-events-none absolute inset-y-0 right-3 flex items-center justify-center px-3 opacity-0 transition-opacity data-[visible]:opacity-100"
        >
          <Spinner />
        </div>
      </div>
      {searchItems.length > 0 && (
        <div className="max-h-80 overflow-y-scroll">
          {searchItems.map((video) => (
            <SearchResultItem key={video.id} roomId={roomId} video={video} />
          ))}
        </div>
      )}
    </div>
  )
}

function SearchResultItem({ roomId, video }: { roomId: string; video: Video }) {
  const fetcher = useFetcher<typeof action>()
  const pending = fetcher.state === "submitting"

  useEffect(() => {
    if (fetcher.data?.error) {
      console.error(fetcher.data.error)
    }
  }, [fetcher.data?.error])

  return (
    <>
      <input type="hidden" name="url" value={video.link} />
      <button
        type="button"
        className="button flex w-full items-center gap-3 rounded-none border-none bg-transparent text-left ring-inset data-[pending]:opacity-75"
        data-pending={pending || undefined}
        data-focus-target
        data-search-result-item
        onClick={() => {
          if (pending) return
          fetcher.submit(
            { url: video.link },
            {
              action: $path("/rooms/:roomId/submit", { roomId }),
              method: "POST",
            },
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
        <div
          data-pending={pending || undefined}
          className="opacity-0 transition-opacity data-[pending]:opacity-100"
        >
          <Spinner />
        </div>
      </button>
    </>
  )
}
