import prettyMilliseconds from "pretty-ms"
import { useRoomQueue } from "./room-state-context"

export function RoomQueue() {
  const queue = useRoomQueue()
  return (
    <ul className="panel border divide-y divide-white/10">
      {queue.items.map(({ id, submitter, track: { metadata } }) => (
        <li key={id} className="flex flex-row gap-3 p-3">
          {metadata.artwork ? (
            <img
              src={metadata.artwork}
              alt=""
              className="h-12 w-12 border border-white/10 rounded object-cover"
            />
          ) : null}
          <div className="flex-1 leading-5">
            <p className="text-sm text-gray-400">
              {metadata.artist} &bull;{" "}
              {prettyMilliseconds(metadata.duration * 1000, {
                colonNotation: true,
              })}{" "}
              &bull; added by{" "}
              {queue.submitters.find((s) => s.id === submitter)?.display_name ??
                "unknown"}
            </p>
            <p className="text-lg font-light">{metadata.title}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}
