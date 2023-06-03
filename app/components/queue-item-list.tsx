import {
  useCurrentRoomQueueItem,
  useRoomQueue,
} from "~/components/room-state-context"
import { SongList, SongListItem } from "~/components/song-list"
import { type QueueItem } from "~/data/vinyl-types"

export function QueueItemList({ items }: { items: QueueItem[] }) {
  const queue = useRoomQueue()
  const current = useCurrentRoomQueueItem()

  const getSubmitterName = (submitterId: string) =>
    queue.submitters.find((s) => s.id === submitterId)?.display_name ??
    "unknown"

  return (
    <SongList>
      {items.map(({ id, submitter, track: { metadata } }) => (
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
  )
}
