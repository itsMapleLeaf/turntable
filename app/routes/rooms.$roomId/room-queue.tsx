import prettyMilliseconds from "pretty-ms"
import { useCurrentRoomQueueItem, useRoomQueue } from "./room-state-context"

export function RoomQueue() {
  const queue = useRoomQueue()
  const current = useCurrentRoomQueueItem()
  const currentIndex = queue.items.findIndex((i) => i.id === current?.id)

  const getSubmitterName = (submitterId: string) =>
    queue.submitters.find((s) => s.id === submitterId)?.display_name ??
    "unknown"

  return (
    <ul className="panel border">
      {queue.items
        .slice(currentIndex)
        .map(({ id, submitter, track: { metadata } }) => (
          <li key={id} className="-m-px">
            <a
              href={metadata.canonical}
              target="_blank"
              rel="noopener noreferrer"
              data-current={current?.id === id || undefined}
              className="group flex flex-row gap-3 border border-transparent from-accent-200/10 p-3 transition-colors hover:text-accent-200 data-[current]:border-accent-200/25 data-[current]:bg-gradient-to-r data-[current]:text-accent-200"
            >
              {metadata.artwork ? (
                <img
                  src={metadata.artwork}
                  alt=""
                  className="h-12 w-12 rounded border border-white/10 object-cover transition-colors group-hover:border-accent-200/25"
                />
              ) : null}
              <div className="flex flex-1 flex-col justify-center">
                <p className="text-sm/5 opacity-75">
                  {metadata.artist} &bull;{" "}
                  {prettyMilliseconds(metadata.duration * 1000, {
                    colonNotation: true,
                    secondsDecimalDigits: 0,
                  })}{" "}
                  &bull; added by {getSubmitterName(submitter)}
                </p>
                <p className="text-lg/5">{metadata.title}</p>
              </div>
            </a>
          </li>
        ))}
    </ul>
  )
}
