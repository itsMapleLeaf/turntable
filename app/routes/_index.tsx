import { Link, useLoaderData } from "@remix-run/react"
import { LoaderArgs, json, redirect } from "@vercel/remix"
import { vinylApi } from "~/vinyl-api.server"

export async function loader({ request }: LoaderArgs) {
  const api = vinylApi(request)
  const [user, rooms] = await Promise.all([api.getUser(), api.getRooms()])
  return user.data ? json({ rooms }) : redirect("/sign-in")
}

export default function Home() {
  const { rooms } = useLoaderData<typeof loader>()
  return (
    <>
      <h1>Rooms</h1>
      {"data" in rooms ? (
        <ul>
          {rooms.data.map((room) => (
            <li key={room.id}>
              <Link to={`/rooms/${room.id}`}>{room.name}</Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>{rooms.error}</p>
      )}
    </>
  )
}
