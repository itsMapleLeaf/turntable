import { createCookie } from "@remix-run/node"
import { z } from "zod"

const sessionCookie = createCookie("vinyl-session", {
  httpOnly: true,
  path: "/",
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 60 * 60 * 24 * 365,
})

const sessionSchema = z.object({
  token: z.string(),
})

export function createSession(token: string) {
  return sessionCookie.serialize(sessionSchema.parse({ token }))
}

export function destroySession() {
  return sessionCookie.serialize(null)
}

export async function getSession(headers: Headers) {
  return sessionSchema
    .nullish()
    .parseAsync(await sessionCookie.parse(headers.get("Cookie")))
    .catch(() => undefined)
}
