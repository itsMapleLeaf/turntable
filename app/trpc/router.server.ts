import { initTRPC } from "@trpc/server"
import { type Context } from "./context.server"

const t = initTRPC.context<Context>().create()

export const appRouter = t.router({
  hello: t.procedure.query(() => "hi"),
})

export type AppRouter = typeof appRouter
