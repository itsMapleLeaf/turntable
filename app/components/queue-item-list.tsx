import prettyMilliseconds from "pretty-ms"
import { type ComponentPropsWithoutRef, useEffect, useRef } from "react"
import { Virtuoso } from "react-virtuoso"
import { useCurrentRoomQueueItem, useRoomQueue } from "~/components/room-state-context"
import { type QueueItem } from "~/data/vinyl-types"

export function QueueItemList({ items }: { items: QueueItem[] }) {
  const queue = useRoomQueue()
  const current = useCurrentRoomQueueItem()

  const getSubmitterName = (submitterId: string) =>
    queue.submitters.find((s) => s.id === submitterId)?.display_name
      ?? "unknown"

  return (
    <Virtuoso
      data={items}
      className="panel border"
      useWindowScroll
      itemContent={(_index, { id, submitter, track: { metadata } }) => (
        <a
          href={metadata.canonical}
          target="_blank"
          rel="noopener noreferrer"
          data-active={current?.id === id || undefined}
          className="group flex flex-row gap-3 border border-transparent from-accent-200/10 p-3 transition-colors hover:text-accent-200 data-[active]:border-accent-200/25 data-[active]:bg-gradient-to-r data-[active]:text-accent-200"
        >
          {metadata.artwork
            ? (
              <FancyImage
                src={metadata.artwork}
                alt=""
                className="h-12 w-12 rounded border border-white/10 object-cover transition-colors group-hover:border-accent-200/25"
              />
            )
            : null}
          <div className="flex flex-1 flex-col justify-center">
            <p className="text-sm/5 opacity-75">
              {metadata.artist} &bull; {prettyMilliseconds(metadata.duration * 1000, {
                colonNotation: true,
                secondsDecimalDigits: 0,
              })} &bull; added by {getSubmitterName(submitter)} &bull; {metadata.source}
            </p>
            <p className="text-lg/5">{metadata.title}</p>
          </div>
        </a>
      )}
    />
  )
}

function FancyImage(props: ComponentPropsWithoutRef<"img">) {
  const ref = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const image = ref.current as HTMLImageElement
    image.style.opacity = "0"
    void imageLoaded(image).then(() => {
      image.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: 500,
        fill: "forwards",
      })
    })
  }, [])

  return <img alt="" {...props} ref={ref} />
}

function imageLoaded(image: HTMLImageElement) {
  return new Promise((resolve, reject) => {
    if (image.complete) {
      resolve(image)
    } else {
      image.addEventListener("load", () => resolve(image), { once: true })
      image.addEventListener("error", reject, { once: true })
    }
  })
}
