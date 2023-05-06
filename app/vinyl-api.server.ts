import { z } from "zod"
import { vinylTokenCookie } from "./vinyl-token-cookie"

const apiUrl = new URL(
  "/v1/",
  process.env.VINYL_API_URL || "http://localhost:9050",
)

type Json = string | number | boolean | null | Json[] | { [key: string]: Json }

type BaseFetchArgs<T> =
  | {
      request: Request
      method: "GET"
      path: string
      schema?: z.Schema<T>
      body?: never
    }
  | {
      request: Request
      method: "POST" | "PATCH" | "PUT" | "DELETE"
      path: string
      schema?: z.Schema<T>
      body: Json
    }

export type VinylApiResult<T> =
  | { data: T; error?: undefined }
  | { data?: undefined; error: string }

export async function vinylFetch<T>({
  request,
  method,
  path,
  schema,
  body,
}: BaseFetchArgs<T>): Promise<VinylApiResult<T>> {
  const url = new URL(path, apiUrl)

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }

    const token = await vinylTokenCookie.parse(request.headers.get("Cookie"))
    if (typeof token === "string") {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(url, {
      method,
      headers,
      ...(body && { body: JSON.stringify(body) }),
    })

    if (!response.ok) {
      const error = await response.text().catch(() => undefined)
      return {
        error: error || `API error: ${response.status} ${response.statusText}`,
      }
    }

    const json = await response.json()
    return { data: schema ? schema.parse(json) : json }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return { error: `${method} ${url.pathname} failed  (${errorMessage})` }
  }
}

const authResponseSchema = z.object({
  token: z.string(),
})

const userSchema = z.object({
  id: z.string(),
  username: z.string(),
  display_name: z.string(),
})
export type User = z.infer<typeof userSchema>

const roomSchema = z.object({
  id: z.string(),
  name: z.string(),
  connections: z.array(userSchema),
})

export function vinylApi(request: Request) {
  return {
    register(body: { username: string; password: string }) {
      return vinylFetch({
        request,
        method: "POST",
        path: "auth/register",
        body,
        schema: authResponseSchema,
      })
    },

    login(body: { username: string; password: string }) {
      return vinylFetch({
        request,
        method: "POST",
        path: "auth/login",
        body,
        schema: authResponseSchema,
      })
    },

    getUser() {
      return vinylFetch({
        request,
        method: "GET",
        path: "auth/user",
        schema: userSchema,
      })
    },

    getRooms() {
      return vinylFetch({
        request,
        method: "GET",
        path: "rooms",
        schema: z.array(roomSchema),
      })
    },

    getRoom(roomId: string) {
      return vinylFetch({
        request,
        method: "GET",
        path: `rooms/${roomId}`,
        schema: roomSchema,
      })
    },

    submitSong(roomId: string, url: string) {
      return vinylFetch({
        request,
        method: "POST",
        path: `audio/input`,
        body: { url },
      })
    },
  }
}
