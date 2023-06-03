import { useParams } from "@remix-run/react"
import { $params } from "remix-routes"

export default function RoomHistoryPage() {
  const { roomId } = $params("/rooms/:roomId/history", useParams())
  return (
    <section className="grid gap-4">
      <h2 className="sr-only">History</h2>
      the
    </section>
  )
}
