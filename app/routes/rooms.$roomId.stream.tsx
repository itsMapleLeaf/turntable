import { type LoaderArgs } from "@remix-run/node"
import { vinylApi } from "~/data/vinyl-api.server"
import { getSessionToken } from "~/data/vinyl-session"
import { raise } from "~/helpers/raise"

export async function loader({ request, params }: LoaderArgs) {
  const token = await getSessionToken(request)
  if (!token) {
    return new Response(undefined, { status: 401 })
  }

  return vinylApi(request).getRoomStream(
    params.roomId ?? raise("roomId not defined"),
    token,
    request.signal,
  )
}
