import { useFetcher } from "@remix-run/react"
import { json, type ActionArgs } from "@vercel/remix"
import { useCombobox } from "downshift"
import { Plus } from "lucide-react"
import { forwardRef, useRef, type ForwardedRef } from "react"
import { $params, $path } from "remix-routes"
import { type Video } from "scraper-edge"
import { zfd } from "zod-form-data"
import { Button } from "~/components/button"
import { Spinner } from "~/components/spinner"
import { vinylApi } from "~/data/vinyl-api.server"
import { useRect } from "~/helpers/use-rect"
import { useSearchFetcher } from "~/routes/search"

export async function action({ request, params }: ActionArgs) {
  const { roomId } = $params("/rooms/:roomId/submit", params)
  const body = zfd.formData({ url: zfd.text() }).parse(await request.formData())
  const result = await vinylApi(request).submitSong(roomId, body.url)
  return json({ error: result.error })
}

export function AddSongForm({ roomId }: { roomId: string }) {
  const trackSubmitFetcher = useFetcher<typeof action>()
  const trackSubmitPending = trackSubmitFetcher.state === "submitting"

  const searchFetcher = useSearchFetcher()
  const searchItems = searchFetcher.data?.data ?? []

  const combobox = useCombobox({
    items: searchItems,
    onInputValueChange: ({ inputValue }) => {
      if (inputValue) searchFetcher.load(inputValue)
    },
    onSelectedItemChange: ({ selectedItem }) => {
      if (!selectedItem) return
      trackSubmitFetcher.submit(
        { url: selectedItem.link },
        { method: "POST", action: `/rooms/${roomId}/submit`, replace: true },
      )
    },
    stateReducer(state, { type, changes }) {
      if (
        type === useCombobox.stateChangeTypes.InputKeyDownEnter ||
        type === useCombobox.stateChangeTypes.ItemClick
      ) {
        return {
          ...changes,
          isOpen: true,
          highlightedIndex: state.highlightedIndex,
          inputValue: state.inputValue,
        }
      }
      return changes
    },
  })

  const anchorRef = useRef<HTMLDivElement | null>(null)
  const anchorRect = useRect(anchorRef)

  return (
    <trackSubmitFetcher.Form
      method="POST"
      action={$path("/rooms/:roomId/submit", { roomId })}
      className="divide-y divide-white/10"
    >
      <div className="flex flex-row gap-2 p-3" ref={anchorRef}>
        <div className="relative flex-1">
          <input
            {...combobox.getInputProps({
              onFocus: (event) => event.currentTarget.select(),
            })}
            name="url"
            placeholder="Search or enter song URL"
            className="input h-full"
            required
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
      </div>

      <div
        {...combobox.getMenuProps()}
        data-open={combobox.isOpen || undefined}
        className="panel hidden max-h-80 overflow-y-scroll border bg-transparent data-[open]:block"
        style={{ width: anchorRect?.width }}
      >
        {/* {debouncedSearchInput &&
          searchFetcher.state === "idle" &&
          searchItems.length === 0 && (
            // eslint-disable-next-line react/no-unescaped-entities
            <p className="p-3">No results found for "{debouncedSearchInput}"</p>
          )} */}
        {searchItems.map((video, index) => (
          <SearchResultItem
            {...combobox.getItemProps({
              item: video,
              index,
            })}
            key={video.id}
            roomId={roomId}
            video={video}
            pending={
              trackSubmitFetcher.submission?.formData?.get("url") === video.link
            }
          />
        ))}
      </div>

      {!trackSubmitPending && trackSubmitFetcher.data?.error ? (
        <p className="p-3 text-sm text-error-400">
          {trackSubmitFetcher.data?.error}
        </p>
      ) : null}
    </trackSubmitFetcher.Form>
  )
}

const SearchResultItem = forwardRef(function SearchResultItem(
  {
    roomId,
    video,
    pending,
    ...props
  }: {
    roomId: string
    video: Video
    pending: boolean
  },
  ref: ForwardedRef<HTMLButtonElement>,
) {
  return (
    <button
      {...props}
      ref={ref}
      type="button"
      className="button flex w-full items-center gap-3 rounded-none border-0 text-left ring-inset aria-selected:bg-accent-200/10 aria-selected:text-accent-200"
      disabled={pending}
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
})
