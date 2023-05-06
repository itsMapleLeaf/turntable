import { createCookie } from "@vercel/remix"

export const vinylTokenCookie = createCookie("vinyl-token", {
  httpOnly: true,
  path: "/",
})
