import { z } from "zod"
import { raise } from "~/helpers/errors"
import { queueSchema, roomSchema, userSchema, type Room } from "./vinyl-types"

const apiUrl = new URL(
  "/v1/",
  process.env.VINYL_API_URL || "http://localhost:9050",
)

type BaseFetchArgs<T> =
  | {
      token: string | undefined
      method: "GET"
      path: string
      schema: z.Schema<T>
      body?: never
    }
  | {
      token: string | undefined
      method: "POST" | "PATCH" | "PUT" | "DELETE"
      path: string
      schema: z.Schema<T>
      body: Json
    }

async function vinylFetch<T>({
  token,
  method,
  path,
  schema,
  body,
}: BaseFetchArgs<T>): Promise<T> {
  const url = new URL(path, apiUrl)

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(url, {
    method,
    headers,
    ...(body && { body: JSON.stringify(body) }),
  })

  if (!response.ok) {
    const error = await response.text().catch(() => undefined)
    throw new VinylApiError(
      error ||
        `Failed to ${method} ${path} (${response.status} ${response.statusText})`,
      response.status,
    )
  }

  const json = await response.json()
  console.info("[vinyl]", method, url.pathname, json)
  return schema.parse(json)
}

const authResponseSchema = z.object({
  token: z.string(),
})

export function vinylApi(token: string | undefined) {
  return {
    register(body: { username: string; password: string }) {
      return vinylFetch({
        token,
        method: "POST",
        path: "auth/register",
        body,
        schema: authResponseSchema,
      })
    },

    login(body: { username: string; password: string }) {
      return vinylFetch({
        token,
        method: "POST",
        path: "auth/login",
        body,
        schema: authResponseSchema,
      })
    },

    getUser() {
      return vinylFetch({
        token,
        method: "GET",
        path: "auth/user",
        schema: userSchema,
      })
    },

    createRoom(name: string) {
      return vinylFetch({
        token,
        method: "POST",
        path: "rooms",
        body: { name },
        schema: roomSchema,
      })
    },

    getRooms() {
      return vinylFetch({
        token,
        method: "GET",
        path: "rooms",
        schema: z.array(roomSchema),
      })
    },

    async getRoom(roomId: string): Promise<Room> {
      const rooms = await vinylFetch({
        token,
        method: "GET",
        path: "rooms",
        schema: z.array(roomSchema),
      })
      return (
        rooms.find((r) => r.id === roomId) ??
        raise(new VinylApiError("Room not found", 500))
      )
    },

    async getRoomQueue(roomId: string) {
      return vinylFetch({
        token,
        method: "GET",
        path: `rooms/${roomId}/queue`,
        schema: queueSchema,
      })
    },

    getRoomStreamUrl(roomId: string, token: string) {
      return new URL(`/v1/rooms/${roomId}/stream?token=${token}`, apiUrl)
    },

    getGatewayUrl(token: string) {
      return new URL(`/v1/events?token=${token}`, apiUrl)
    },

    async submitSong(roomId: string, url: string) {
      const headers: Record<string, string> = {
        "Content-Type": "text/plain",
      }

      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch(new URL(`rooms/${roomId}/queue`, apiUrl), {
        method: "POST",
        headers,
        body: url,
      })

      if (!response.ok) {
        const error = await response.text().catch(() => undefined)
        throw new VinylApiError(
          error ||
            `Failed to submit song (${response.status} ${response.statusText})`,
          response.status,
        )
      }
    },
  }
}

export class VinylApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
  }
}
