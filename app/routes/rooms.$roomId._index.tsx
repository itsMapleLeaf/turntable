import { useParams } from "@remix-run/react"
import { $params } from "remix-routes"
import { AddSongForm } from "./rooms.$roomId.submit"
import { RoomQueue } from "./rooms.$roomId/room-queue"

export default function RoomQueuePage() {
  const { roomId } = $params("/rooms/:roomId", useParams())
  return (
    <div className="grid gap-4">
      <div className="panel">
        <AddSongForm roomId={roomId} />
      </div>
      <RoomQueue />
    </div>
  )
}
