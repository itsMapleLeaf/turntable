import { LoaderArgs, json, redirect } from "@vercel/remix"
import { vinylApi } from "~/vinyl-api.server"

export async function loader({ request }: LoaderArgs) {
  const user = await vinylApi(request).getUser()
  if (!user.data) {
    return redirect(`/sign-in?redirect=${request.url}`)
  }

  return json({})
}

export default function CreateRoomPage() {
  return (
    <main className="container py-4">
      <h1>Create Room</h1>
    </main>
  )
}
