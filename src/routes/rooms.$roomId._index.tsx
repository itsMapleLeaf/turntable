import { useParams } from "@remix-run/react"
import { $params } from "remix-routes"
import { QueueItemList } from "~/components/queue-item-list"
import { useCurrentRoomQueueItem, useRoomQueue } from "~/components/room-state-context"
import { AddSongForm } from "./rooms.$roomId.submit"

export default function RoomQueuePage() {
  const { roomId } = $params("/rooms/:roomId", useParams())
  const queue = useRoomQueue()
  const current = useCurrentRoomQueueItem()
  const currentIndex = queue.items.findIndex((i) => i.id === current?.id)
  const items = queue.items.slice(currentIndex)
  return (
    <section className="grid gap-4">
      <h2 className="sr-only">Queue</h2>
      <div className="panel">
        <AddSongForm roomId={roomId} />
      </div>
      {items.length > 0 ? <QueueItemList items={items} /> : <p>The queue is empty.</p>}
    </section>
  )
}
