export default function RoomPage({ params }: { params: { roomId: string } }) {
  return (
    <main className="container py-4">
      <h1>Room {params.roomId}</h1>
    </main>
  )
}
