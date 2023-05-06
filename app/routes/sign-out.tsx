import { redirect } from "@vercel/remix"
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
