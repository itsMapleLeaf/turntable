import { z } from "zod"
import { getSessionToken } from "./vinyl-session"
import { queueSchema, roomSchema, userSchema, type Room } from "./vinyl-types"

const apiUrl = new URL(
  "/v1/",
  import.meta.env.VITE_APP_VINYL_API_URL || "http://localhost:9050",
)
const socketUrl = new URL(
  "/v1/",
  import.meta.env.VITE_APP_VINYL_SOCKET_URL || "ws://localhost:9050",
)

type Json = string | number | boolean | null | Json[] | { [key: string]: Json }

type BaseFetchArgs<T> =
  | {
      method: "GET"
      path: string
      schema: z.Schema<T>
      body?: never
    }
  | {
      method: "POST" | "PATCH" | "PUT" | "DELETE"
      path: string
      schema: z.Schema<T>
      body: Json
    }

export type VinylApiResult<T> =
  | { data: T; error?: null }
  | { data?: null; error: string }

export async function vinylFetch<T>({
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

    const token = getSessionToken()
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

    const json = (await response.json()) as unknown

    console.info("[vinyl]", method, url.pathname, json)

    return { data: schema.parse(json) }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return { error: `${method} ${url.pathname} failed  (${errorMessage})` }
  }
}

const authResponseSchema = z.object({
  token: z.string(),
})

export function vinylApi() {
  return {
    register(body: { username: string; password: string }) {
      return vinylFetch({
        method: "POST",
        path: "auth/register",
        body,
        schema: authResponseSchema,
      })
    },

    login(body: { username: string; password: string }) {
      return vinylFetch({
        method: "POST",
        path: "auth/login",
        body,
        schema: authResponseSchema,
      })
    },

    // todo: namespace these?
    getUser() {
      return vinylFetch({
        method: "GET",
        path: "auth/user",
        schema: userSchema,
      })
    },

    createRoom(name: string) {
      return vinylFetch({
        method: "POST",
        path: "rooms",
        body: { name },
        schema: roomSchema,
      })
    },

    getRooms() {
      return vinylFetch({
        method: "GET",
        path: "rooms",
        schema: z.array(roomSchema),
      })
    },

    async getRoom(roomId: string): Promise<VinylApiResult<Room>> {
      const rooms = await vinylFetch({
        method: "GET",
        path: "rooms",
        schema: z.array(roomSchema),
      })

      if (!rooms.data) {
        return rooms
      }

      const room = rooms.data.find((r) => r.id === roomId)
      if (!room) {
        return { error: "Room not found" }
      }

      return { data: room }
    },

    async getRoomQueue(roomId: string) {
      return vinylFetch({
        method: "GET",
        path: `rooms/${roomId}/queue`,
        schema: queueSchema,
      })
    },

    getRoomStreamUrl(roomId: string, token: string) {
      return new URL(`/v1/rooms/${roomId}/stream?token=${token}`, apiUrl)
    },

    getGatewayUrl(token: string) {
      return new URL(`/v1/gateway?token=${token}`, socketUrl)
    },

    async submitSong(
      roomId: string,
      url: string,
    ): Promise<VinylApiResult<null>> {
      try {
        const headers: Record<string, string> = {
          "Content-Type": "text/plain",
        }

        const token = getSessionToken()
        if (typeof token === "string") {
          headers.Authorization = `Bearer ${token}`
        }

        const response = await fetch(new URL(`rooms/${roomId}/queue`, apiUrl), {
          method: "POST",
          headers,
          body: url,
        })

        if (!response.ok) {
          const error = await response.text().catch(() => undefined)
          return {
            error:
              error || `API error: ${response.status} ${response.statusText}`,
          }
        }

        return { data: null }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error)
        return { error: `Failed to submit song (${errorMessage})` }
      }
    },
  }
}
