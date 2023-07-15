import type { ActionArgs, LoaderArgs } from "@remix-run/node"
import { fetchRequestHandler } from "@trpc/server/adapters/fetch"
import { createContext } from "~/trpc/context.server"
import { appRouter } from "~/trpc/router.server"

export const loader = (args: LoaderArgs) => handleRequest(args)
export const action = (args: ActionArgs) => handleRequest(args)

function handleRequest(args: LoaderArgs | ActionArgs) {
  return fetchRequestHandler({
    endpoint: "/trpc",
    req: args.request,
    router: appRouter,
    createContext,
  })
}
