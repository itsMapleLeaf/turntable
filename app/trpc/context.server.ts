import { type FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch"
import { getSession } from "./session.server"
import { createVinylApi } from "./vinyl-api.server"

export async function createContext({
  req,
  resHeaders,
}: FetchCreateContextFnOptions) {
  const session = await getSession(req.headers)
  return {
    req,
    resHeaders,
    session,
    api: createVinylApi(session?.token),
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>
