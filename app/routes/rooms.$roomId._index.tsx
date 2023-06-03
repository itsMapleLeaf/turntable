import { useParams } from "@remix-run/react"
import { $params } from "remix-routes"
import { RoomQueue } from "../components/room-queue"
import { AddSongForm } from "./rooms.$roomId.submit"

export default function RoomQueuePage() {
  const { roomId } = $params("/rooms/:roomId", useParams())
  return (
    <section className="grid gap-4">
      <h2 className="sr-only">Queue</h2>
      <div className="panel">
        <AddSongForm roomId={roomId} />
      </div>
      <RoomQueue />
    </section>
  )
}
