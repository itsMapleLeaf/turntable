import { useCurrentRoomQueueItem, useRoomQueue } from "./room-state-context"
import { SongList, SongListItem } from "./song-list"

export function RoomQueue() {
  const queue = useRoomQueue()
  const current = useCurrentRoomQueueItem()
  const currentIndex = queue.items.findIndex((i) => i.id === current?.id)

  const getSubmitterName = (submitterId: string) =>
    queue.submitters.find((s) => s.id === submitterId)?.display_name ??
    "unknown"

  return (
    <SongList>
      {queue.items
        .slice(currentIndex)
        .map(({ id, submitter, track: { metadata } }) => (
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
