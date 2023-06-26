import { createCookie } from "@remix-run/node"

const vinylTokenCookie = createCookie("vinyl-token", {
  httpOnly: true,
  path: "/",
})

export function createSession(token: string) {
  return vinylTokenCookie.serialize(token)
}

export function destroySession() {
  return vinylTokenCookie.serialize("", { maxAge: 0 })
}

export async function getSessionToken(request: Request) {
  const result = (await vinylTokenCookie.parse(
    request.headers.get("Cookie") ?? "",
  )) as unknown
  if (result == null) return null

  if (typeof result !== "string") {
    console.warn(`Unexpected token type: ${typeof result}`)
    return null
  }

  return result
}
