import { QueueItemList } from "~/components/queue-item-list"
import { useCurrentRoomQueueItem, useRoomQueue } from "~/components/room-state-context"

export default function RoomHistoryPage() {
  const queue = useRoomQueue()
  const current = useCurrentRoomQueueItem()
  const currentIndex = queue.items.findIndex((i) => i.id === current?.id)
  const historyItems = queue.items.slice(0, currentIndex).reverse()

  return (
    <section className="grid gap-4">
      <h2 className="sr-only">History</h2>
      {historyItems.length > 0
        ? <QueueItemList items={historyItems} />
        : (
          <p className="panel border p-3">
            <span className="opacity-75">This room has no history.</span>
          </p>
        )}
    </section>
  )
}
