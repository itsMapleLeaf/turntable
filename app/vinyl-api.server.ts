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
      schema: z.Schema<T>
      body?: never
    }
  | {
      request: Request
      method: "POST" | "PATCH" | "PUT" | "DELETE"
      path: string
      schema: z.Schema<T>
      body: Json
    }

type Result<T> =
  | { data: T; error?: undefined }
  | { data?: undefined; error: string }

export async function vinylFetch<T>({
  request,
  method,
  path,
  schema,
  body,
}: BaseFetchArgs<T>): Promise<Result<T>> {
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
      return {
        error: await response.text().catch(() => "Unknown error"),
      }
    }

    const json = await response.json()
    return { data: schema.parse(json) }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return { error: `${method} ${url.pathname} failed  (${errorMessage})` }
  }
}

const roomSchema = z.object({
  id: z.string(),
  name: z.string(),
})

const authResponseSchema = z.object({
  token: z.string(),
})

const userSchema = z.object({
  id: z.string(),
  username: z.string(),
  display_name: z.string(),
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
  }
}
