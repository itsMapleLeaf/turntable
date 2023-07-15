import { redirect, type LoaderArgs } from "@remix-run/node"
import { destroySession } from "~/data/vinyl-session.server"

export async function loader({ request }: LoaderArgs) {
  return redirect(request.headers.get("referer") ?? "/", {
    headers: {
      "Set-Cookie": await destroySession(),
    },
  })
}
