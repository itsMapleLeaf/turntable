import { redirect } from "@vercel/remix"
import { destroySession } from "~/vinyl-session"

export async function loader() {
  return redirect("/sign-in", {
    headers: {
      "Set-Cookie": await destroySession(),
    },
  })
}
