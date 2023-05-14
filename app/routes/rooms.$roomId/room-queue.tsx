import prettyMilliseconds from "pretty-ms"
import { useCurrentRoomQueueItem, useRoomQueue } from "./room-state-context"

export function RoomQueue() {
  const queue = useRoomQueue()
  const current = useCurrentRoomQueueItem()
  return (
    <ul className="panel border isolate">
      {queue.items.map(({ id, submitter, track: { metadata } }) => (
        <li
          key={id}
          data-current={current?.id === id || undefined}
          className="flex flex-row gap-3 p-3 data-[current]:text-accent-200 data-[current]:bg-gradient-to-r from-accent-200/10 border -m-px border-transparent data-[current]:border-accent-200/25"
        >
          {metadata.artwork ? (
            <img
              src={metadata.artwork}
              alt=""
              className="h-12 w-12 border border-white/10 rounded object-cover"
            />
          ) : null}
          <div className="flex-1 flex flex-col justify-center">
            <p className="text-sm/5 opacity-75">
              {metadata.artist} &bull;{" "}
              {prettyMilliseconds(metadata.duration * 1000, {
                colonNotation: true,
              })}{" "}
              &bull; added by{" "}
              {queue.submitters.find((s) => s.id === submitter)?.display_name ??
                "unknown"}
            </p>
            <p className="text-lg/5">{metadata.title}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}
