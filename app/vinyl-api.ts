import { z } from "zod"

const apiUrl = new URL(
  "/v1/",
  process.env.NEXT_PUBLIC_VINYL_API_URL || "http://localhost:9050",
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

type Result<T> =
  | { data: T; error?: undefined }
  | { data?: undefined; error: string }

const roomSchema = z.object({
  id: z.string(),
  name: z.string(),
})

const registerResponseSchema = z.object({
  token: z.string(),
})

const userSchema = z.object({
  id: z.string(),
  username: z.string(),
  display_name: z.string(),
})

export function vinylApi(token?: string) {
  async function baseFetch<T>({
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

      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch(url, {
        method,
        headers,
        ...(body && { body: JSON.stringify(body) }),
      })
      if (!response.ok) {
        return {
          error: `${method} ${url.pathname} failed (${response.status} ${response.statusText})`,
        }
      }

      const json = await response.json()
      return { data: schema.parse(json) }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      return { error: `${method} ${url.pathname} failed  (${errorMessage})` }
    }
  }

  return {
    register(username: string, password: string) {
      return baseFetch({
        method: "POST",
        path: "auth/register",
        schema: registerResponseSchema,
        body: { username, password },
      })
    },

    getUser() {
      return baseFetch({
        method: "GET",
        path: "auth/user",
        schema: userSchema,
      })
    },

    getRooms() {
      return baseFetch({
        method: "GET",
        path: "rooms",
        schema: z.array(roomSchema),
      })
    },
  }
}
