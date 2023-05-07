import { LoaderArgs } from "@remix-run/node"
import { vinylApi } from "~/vinyl-api.server"
import { getSessionToken } from "~/vinyl-session"

export async function loader({ request, params }: LoaderArgs) {
  const token = await getSessionToken(request)
  if (!token) {
    return new Response(undefined, { status: 401 })
  }

  return vinylApi(request).getRoomStream(params.roomId!)
}
