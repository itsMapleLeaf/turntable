import { TRPCError } from "@trpc/server"

const vinylApiUrl = new URL(
  "/v1/",
  process.env.VINYL_API_URL || "http://localhost:9050",
)

export function createVinylApi(token: string | undefined) {
  async function vinylFetch({
    method,
    endpoint,
    headers: headersArg,
    body,
  }: {
    method: "GET" | "POST"
    endpoint: string
    headers?: HeadersInit
    body?: BodyInit
  }) {
    const headers = new Headers(headersArg)
    if (token) {
      headers.set("Authorization", `Bearer ${token}`)
    }

    const response = await fetch(new URL(endpoint, vinylApiUrl), {
      method,
      headers,
      body,
    }).catch(() => {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Vinyl API fetch failed (${method} ${endpoint})`,
      })
    })

    if (response.status === 401) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: await response.text(),
      })
    }

    if (!response.ok) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch from vinyl API",
      })
    }

    return response
  }

  async function vinylFetchJson({
    method,
    endpoint,
    body,
  }: {
    method: "GET" | "POST"
    endpoint: string
    body?: Json
  }) {
    const response = await vinylFetch({
      method,
      endpoint,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    return response.json().catch(() => {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to parse JSON from Vinyl API (${method} ${endpoint})`,
      })
    })
  }

  return {
    vinylFetch,
    vinylFetchJson,
    async get(endpoint: string) {
      return vinylFetchJson({ method: "GET", endpoint })
    },
    async post(endpoint: string, body: Json) {
      return vinylFetchJson({ method: "POST", endpoint, body })
    },
  }
}
