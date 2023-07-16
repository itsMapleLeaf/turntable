import {
  LucideChevronLeft,
  LucideChevronRight,
  LucideLink,
  LucideListMusic,
  LucidePlay,
  LucideSquare,
  LucideYoutube,
} from "lucide-react"
import { useMemo, useState, type ReactNode } from "react"
import { Virtuoso } from "react-virtuoso"
import { type Video } from "scraper-edge"
import * as spotifyUri from "spotify-uri"
import { z } from "zod"
import { Button } from "~/components/button"
import { Menu, MenuButton, MenuItemButton, MenuPanel } from "~/components/menu"
import { Spinner } from "~/components/spinner"
import { mod } from "~/helpers/math"
import { useLocalStorageState } from "~/helpers/use-local-storage-state"
import { trpc } from "~/trpc/client"
import { type AppRouterOutput } from "~/trpc/router.server"
import { useYouTubePreview } from "./youtube-preview"

const submitSources = [
  { id: "youtube", name: "YouTube", icon: LucideYoutube },
  { id: "spotify-playlist", name: "Spotify Playlist", icon: LucideListMusic },
  { id: "direct", name: "Direct URL", icon: LucideLink },
] as const

export function AddSongForm({ roomId }: { roomId: string }) {
  const [submitSourceId, setSubmitSourceId] = useLocalStorageState(
    "add-song-form-source",
    "youtube",
    useMemo(() => z.string(), []),
  )

  const submitSource =
    submitSources.find((s) => s.id === submitSourceId) ?? submitSources[0]

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
            onClick={() => setSubmitSourceId(source.id)}
          />
        ))}
      </MenuPanel>
    </Menu>
  )

  return submitSource.id === "youtube" ? (
    <YouTubeSearchSubmitter roomId={roomId} sourceMenu={sourceMenu} />
  ) : submitSource.id === "spotify-playlist" ? (
    <SpotifyPlaylistSubmitter roomId={roomId} sourceMenu={sourceMenu} />
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
  const [query, setQuery] = useState("")

  const searchQuery = trpc.youtube.search.useQuery(
    { query },
    { enabled: !!query.trim() },
  )

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
      <div className="flex gap-2 p-3">
        <div className="relative flex flex-1">
          <input
            type="search"
            name="url"
            placeholder="Search YouTube"
            className="input flex-1"
            required
            data-focus-target
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault()
                document
                  .querySelector<HTMLElement>("[data-search-result-item]")
                  ?.click()
              }
            }}
          />
          <Spinner
            className={`pointer-events-none absolute right-3 self-center transition-opacity ${
              searchQuery.isFetching ? "opacity-100" : "opacity-0"
            }`}
          />
        </div>
        {sourceMenu}
      </div>

      {query.trim() === "" ? null : searchQuery.isLoading ? (
        <p className="p-3">Loading results...</p>
      ) : searchQuery.isError ? (
        <p className="p-3">
          Failed to fetch items: {searchQuery.error.message}
        </p>
      ) : searchQuery.data.length === 0 ? (
        <p className="p-3">No results found.</p>
      ) : (
        <div className="max-h-80 overflow-y-scroll">
          {searchQuery.data.map((video) => (
            <SearchResultItem key={video.id} roomId={roomId} video={video} />
          ))}
        </div>
      )}
    </div>
  )
}

function SpotifyPlaylistSubmitter({
  roomId,
  sourceMenu,
}: {
  roomId: string
  sourceMenu: ReactNode
}) {
  const [input, setInput] = useState("")

  let parsedInput
  try {
    parsedInput = spotifyUri.parse(input)
  } catch {
    /* empty */
  }

  const pending = false

  return (
    <div className="divide-y divide-white/10">
      <div className="flex gap-2 p-3">
        <div className="relative flex flex-1">
          <input
            type="search"
            name="url"
            placeholder="Paste a Spotify playlist URL"
            className="input flex-1"
            required
            data-focus-target
            onChange={(event) => setInput(event.target.value)}
          />
          <Spinner
            className={`pointer-events-none absolute right-3 self-center transition-opacity ${
              pending ? "opacity-100" : "opacity-0"
            }`}
          />
        </div>
        {sourceMenu}
      </div>
      {input.trim().length === 0 ? null : spotifyUri.Playlist.is(
          parsedInput,
        ) ? (
        <SpotifyPlaylistResults roomId={roomId} playlistId={parsedInput.id} />
      ) : (
        <p className="p-3">Only spotify playlist URLs are supported.</p>
      )}
    </div>
  )
}

function SpotifyPlaylistResults({
  roomId,
  playlistId,
}: {
  roomId: string
  playlistId: string
}) {
  const query = trpc.spotify.youtubeVideosFromPlaylist.useInfiniteQuery(
    { playlistId },
    { getNextPageParam: (lastPage) => lastPage.nextCursor },
  )

  return query.isLoading ? (
    <p className="flex items-center gap-2 p-3">
      <Spinner /> Loading results...
    </p>
  ) : query.isError ? (
    <p className="p-3">Failed to fetch videos: {query.error.message}</p>
  ) : (
    <div className="h-96">
      <Virtuoso
        data={query.data.pages.flatMap((page) => page.results)}
        itemContent={(index, result) => (
          <div className={index === 0 ? "" : "border-t border-white/10"}>
            <SpotifySearchResult roomId={roomId} result={result} />
          </div>
        )}
        components={{
          Footer: () =>
            query.hasNextPage ? (
              <button
                type="button"
                className="button w-full"
                onClick={() => {
                  void query.fetchNextPage()
                }}
                disabled={query.isFetchingNextPage}
              >
                {query.isFetchingNextPage ? <Spinner /> : "Load more"}
              </button>
            ) : null,
        }}
      />
    </div>
  )
}

function SpotifySearchResult({
  roomId,
  result,
}: {
  roomId: string
  result: AppRouterOutput["spotify"]["youtubeVideosFromPlaylist"]["results"][number]
}) {
  const [videoIndex, setVideoIndex] = useState(0)
  const currentVideo = result.videos[videoIndex]

  if (!currentVideo) {
    return (
      <p className="p-3">No videos found for "{result.item.track.name}".</p>
    )
  }

  return (
    <div>
      <SearchResultItem roomId={roomId} video={currentVideo} />
      <div className="flex items-center bg-black/50 px-2 py-1">
        <p className="flex-1 text-sm opacity-75">
          {result.item.track.name} by{" "}
          {new Intl.ListFormat(undefined).format(
            result.item.track.artists.map((artist) => artist.name),
          )}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="button border-none p-1"
            onClick={() =>
              setVideoIndex(mod(videoIndex - 1, result.videos.length))
            }
          >
            <LucideChevronLeft /> <span className="sr-only">Previous</span>
          </button>
          <p className="text-sm">
            {videoIndex + 1} / {result.videos.length}
          </p>
          <button
            type="button"
            className="button border-none p-1"
            onClick={() =>
              setVideoIndex(mod(videoIndex + 1, result.videos.length))
            }
          >
            <LucideChevronRight /> <span className="sr-only">Next</span>
          </button>
        </div>
      </div>
    </div>
  )
}

function SearchResultItem({ roomId, video }: { roomId: string; video: Video }) {
  const mutation = trpc.rooms.submit.useMutation()

  return (
    <div className="relative flex">
      <button
        type="button"
        className="button relative flex w-full flex-1 items-center gap-3 rounded-none border-none bg-transparent text-left ring-inset data-[pending]:opacity-75"
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
      <PreviewButton videoId={video.id} />
    </div>
  )
}

function PreviewButton({ videoId }: { videoId: string }) {
  const youTubePreview = useYouTubePreview()
  return youTubePreview.playing && youTubePreview.videoId === videoId ? (
    <button
      type="button"
      className="active-press flex items-center justify-center px-3 transition-colors hover:text-accent-300"
      onClick={() => youTubePreview.stop()}
    >
      <LucideSquare />
      <span className="sr-only">Stop preview</span>
    </button>
  ) : (
    <button
      type="button"
      className="active-press flex items-center justify-center px-3 transition-colors hover:text-accent-300"
      onClick={() => youTubePreview.play(videoId)}
    >
      <LucidePlay />
      <span className="sr-only">Preview</span>
    </button>
  )
}
