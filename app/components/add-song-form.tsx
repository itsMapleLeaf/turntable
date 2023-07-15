import { LucideLink, LucidePlay, LucideYoutube } from "lucide-react"
import { useState, type ReactNode } from "react"
import { type Video } from "scraper-edge"
import { Button } from "~/components/button"
import { Menu, MenuButton, MenuItemButton, MenuPanel } from "~/components/menu"
import { Spinner } from "~/components/spinner"
import { mod } from "~/helpers/math"
import { useSearchFetcher } from "~/routes/search"
import { trpc } from "~/trpc/client"

const submitSources = [
  { name: "YouTube", icon: LucideYoutube },
  { name: "Direct URL", icon: LucideLink },
] as const
type SubmitSource = (typeof submitSources)[number]

export function AddSongForm({ roomId }: { roomId: string }) {
  const [submitSource, setSubmitSource] = useState<SubmitSource>(
    submitSources[0],
  )

  const sourceMenu = (
    <Menu>
      <MenuButton asChild>
        <Button
          element={<button type="button" title="Switch source..." />}
          iconElement={<submitSource.icon />}
        />
      </MenuButton>
      <MenuPanel>
        {submitSources.map((source) => (
          <MenuItemButton
            key={source.name}
            label={source.name}
            icon={source.icon}
            onClick={() => setSubmitSource(source)}
          />
        ))}
      </MenuPanel>
    </Menu>
  )

  return submitSource.name === "YouTube" ? (
    <YouTubeSearchSubmitter roomId={roomId} sourceMenu={sourceMenu} />
  ) : (
    <DirectUrlSubmitter roomId={roomId} sourceMenu={sourceMenu} />
  )
}
function DirectUrlSubmitter({
  roomId,
  sourceMenu,
}: {
  roomId: string
  sourceMenu: ReactNode
}) {
  const mutation = trpc.rooms.submit.useMutation()
  return (
    <form
      className="grid grid-cols-[1fr,auto,auto] gap-2 p-3"
      onSubmit={(event) => {
        event.preventDefault()
        const form = new FormData(event.currentTarget)
        mutation.mutate({ roomId, url: form.get("url") as string })
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
        pendingLabel={
          <span className="sr-only sm:not-sr-only">Submitting...</span>
        }
        pending={mutation.isLoading}
        iconElement={<LucidePlay />}
      />
      {sourceMenu}
      {mutation.isError && (
        <p className="col-span-full text-error-400">{mutation.error.message}</p>
      )}
    </form>
  )
}
function YouTubeSearchSubmitter({
  roomId,
  sourceMenu,
}: {
  roomId: string
  sourceMenu: ReactNode
}) {
  const searchFetcher = useSearchFetcher()
  const searchItems = searchFetcher.data?.data ?? []
  const [searchInputEmpty, setSearchInputEmpty] = useState(true)

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
        <input
          name="url"
          placeholder="Search YouTube"
          className="input flex-1"
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
        {sourceMenu}
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
  const mutation = trpc.rooms.submit.useMutation()

  return (
    <>
      <button
        type="button"
        className="button flex w-full items-center gap-3 rounded-none border-none bg-transparent text-left ring-inset data-[pending]:opacity-75"
        data-pending={mutation.isLoading || undefined}
        data-focus-target
        data-search-result-item
        onClick={() => mutation.mutate({ roomId, url: video.link })}
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
          {mutation.isError && (
            <div className="text-sm text-error-400">
              {mutation.error.message}
            </div>
          )}
        </div>
        <div
          data-pending={mutation.isLoading || undefined}
          className="opacity-0 transition-opacity data-[pending]:opacity-100"
        >
          <Spinner />
        </div>
      </button>
    </>
  )
}
