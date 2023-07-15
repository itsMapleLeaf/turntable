import { TRPCError, initTRPC } from "@trpc/server"
import { z } from "zod"
import { userSchema } from "~/data/vinyl-types"
import { type Context } from "./context.server"
import { createSession, destroySession } from "./session.server"

const t = initTRPC.context<Context>().create()

export const appRouter = t.router({
  auth: t.router({
    login: t.procedure
      .input(z.object({ username: z.string(), password: z.string() }))
      .mutation(async (args) => {
        const response = authResponseSchema.parse(
          await args.ctx.api.post("auth/login", args.input),
        )

        args.ctx.resHeaders.append(
          "Set-Cookie",
          await createSession(response.token),
        )
      }),

    register: t.procedure
      .input(
        z.object({
          username: z.string(),
          password: z.string(),
          passwordRepeat: z.string(),
        }),
      )
      .mutation(async (args) => {
        if (args.input.password !== args.input.passwordRepeat) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Passwords don't match",
          })
        }

        const response = authResponseSchema.parse(
          await args.ctx.api.post("auth/register", args.input),
        )

        args.ctx.resHeaders.append(
          "Set-Cookie",
          await createSession(response.token),
        )
      }),

    logout: t.procedure.mutation(async (args) => {
      args.ctx.resHeaders.append("Set-Cookie", await destroySession())
    }),

    user: t.procedure.query(async (args) => {
      const user = await args.ctx.api.get("auth/user").catch((error) => {
        if (error instanceof TRPCError && error.code === "UNAUTHORIZED") {
          return null
        }
        throw error
      })
      return user ? userSchema.parse(user) : null
    }),
  }),
})

export type AppRouter = typeof appRouter

const authResponseSchema = z.object({
  token: z.string(),
  user: userSchema,
})
