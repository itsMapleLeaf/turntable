import { AddSongForm } from "./add-song-form"
import { Player } from "./player"

const songs = [
  { id: "1", title: "Song 1", addedBy: "User 1" },
  { id: "2", title: "Song 2", addedBy: "User 2" },
  { id: "3", title: "Song 3", addedBy: "User 3" },
  { id: "4", title: "Song 4", addedBy: "User 4" },
  { id: "5", title: "Song 5", addedBy: "User 5" },
  { id: "6", title: "Song 6", addedBy: "User 6" },
]

export default function RoomPage({ params }: { params: { roomId: string } }) {
  return (
    <>
      <div className="container py-4 flex-1">
        <main className="panel border flex flex-col gap-4 p-4">
          <h1 className="text-2xl font-light">Room {params.roomId}</h1>
          <hr className="-mx-4 border-white/10" />
          <AddSongForm />
          <hr className="-mx-4 border-white/10" />
          <ul className="flex flex-col gap-4">
            {songs.map((song) => (
              <li key={song.id} className="flex flex-row gap-3">
                <div className="w-12 h-12 bg-accent-400" />
                <div className="flex-1 leading-5">
                  <h2 className="text-lg font-light">{song.title}</h2>
                  <p className="text-sm text-gray-400">
                    Added by {song.addedBy}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </main>
      </div>
      <Player />
    </>
  )
}
