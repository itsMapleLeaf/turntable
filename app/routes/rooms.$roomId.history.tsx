import {
  useCurrentRoomQueueItem,
  useRoomQueue,
} from "~/components/room-state-context"
import { SongList, SongListItem } from "~/components/song-list"

export default function RoomHistoryPage() {
  const queue = useRoomQueue()
  const current = useCurrentRoomQueueItem()
  const currentIndex = queue.items.findIndex((i) => i.id === current?.id)
  const historyItems = queue.items.slice(0, currentIndex)

  const getSubmitterName = (submitterId: string) =>
    queue.submitters.find((s) => s.id === submitterId)?.display_name ??
    "unknown"

  return (
    <section className="grid gap-4">
      <h2 className="sr-only">History</h2>
      {historyItems.length > 0 ? (
        <SongList>
          {historyItems.map(({ id, submitter, track: { metadata } }) => (
            <SongListItem
              key={id}
              title={metadata.title}
              artist={metadata.artist}
              addedBy={getSubmitterName(submitter)}
              durationSeconds={metadata.duration}
              artwork={metadata.artwork}
              isActive={current?.id === id}
              link={metadata.canonical}
            />
          ))}
        </SongList>
      ) : (
        <p className="panel border p-3">
          <span className="opacity-75">This room has no history.</span>
        </p>
      )}
    </section>
  )
}
