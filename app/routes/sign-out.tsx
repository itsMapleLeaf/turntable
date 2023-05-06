import { redirect } from "@remix-run/node"
import { vinylTokenCookie } from "~/vinyl-token-cookie"

export async function loader() {
  return redirect("/sign-in", {
    headers: {
      "Set-Cookie": await vinylTokenCookie.serialize("", {
        expires: new Date(0),
      }),
    },
  })
}
