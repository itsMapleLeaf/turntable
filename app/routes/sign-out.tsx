import { type LoaderArgs, redirect } from "@remix-run/node"
import { destroySession } from "~/data/vinyl-session"

export async function loader({ request }: LoaderArgs) {
  return redirect(request.headers.get("referer") ?? "/", {
    headers: {
      "Set-Cookie": await destroySession(),
    },
  })
}
