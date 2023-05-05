import { Disc } from "lucide-react"
import Link from "next/link"

const rooms = [
  { id: "1", name: "Room 1", memberCount: 1 },
  { id: "2", name: "Room 2", memberCount: 2 },
  { id: "3", name: "Room 3", memberCount: 3 },
]

export default function RoomListPage() {
  return (
    <main className="flex-1 flex-col p-4 container">
      <ul className="gap-4 grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))]">
        {rooms.map((room) => (
          <li key={room.id}>
            <Link
              href={`/rooms/${room.id}`}
              className="panel panel-interactive p-4 flex flex-row items-center gap-4 border"
            >
              <Disc size={32} aria-hidden />
              <span className="text-lg/5">
                {room.name}
                <br />
                <span className="text-sm opacity-75">
                  {room.memberCount} member{room.memberCount === 1 ? "" : "s"}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
