import { SpotifyApi } from "@spotify/web-api-ts-sdk"
import { TRPCError, initTRPC, type inferRouterOutputs } from "@trpc/server"
import pLimit from "p-limit"
import { z } from "zod"
import { queueSchema, roomSchema, userSchema } from "~/data/vinyl-types"
import { searchYouTube } from "~/data/youtube.server"
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

  rooms: t.router({
    list: t.procedure.query(async (args) => {
      return z.array(roomSchema).parse(await args.ctx.api.get("rooms"))
    }),

    get: t.procedure.input(z.object({ id: z.string() })).query(async (args) => {
      if (!args.ctx.session) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in",
        })
      }

      const [room, queue] = await Promise.all([
        args.ctx.api.get(`rooms/${args.input.id}`),
        args.ctx.api.get(`rooms/${args.input.id}/queue`),
      ])

      return {
        ...roomSchema.parse(room),
        queue: queueSchema.parse(queue),
        streamUrl: args.ctx.api.apiUrl(
          `rooms/${args.input.id}/stream?token=${args.ctx.session.token}`,
        ).href,
        eventsUrl: args.ctx.api.apiUrl(`events?token=${args.ctx.session.token}`)
          .href,
      }
    }),

    submit: t.procedure
      .input(z.object({ roomId: z.string(), url: z.string() }))
      .mutation(async (args) => {
        await args.ctx.api.vinylFetch({
          method: "POST",
          endpoint: `rooms/${args.input.roomId}/queue`,
          headers: { "Content-Type": "text/plain" },
          body: args.input.url,
        })
      }),
  }),

  youtube: t.router({
    search: t.procedure
      .input(z.object({ query: z.string() }))
      .query((args) => searchYouTube(args.input.query)),
  }),

  spotify: t.router({
    youtubeVideosFromPlaylist: t.procedure
      .input(
        z.object({
          playlistId: z.string(),
          cursor: z.number().optional(),
        }),
      )
      .query(async (args) => {
        const spotify = SpotifyApi.withClientCredentials(
          process.env.SPOTIFY_CLIENT_ID as string,
          process.env.SPOTIFY_CLIENT_SECRET as string,
        )

        const trackItemSchema = z.object({
          track: z.object({
            name: z.string(),
            artists: z.array(z.object({ name: z.string() })),
          }),
        })

        const pageSchema = z.object({
          items: z.array(trackItemSchema.or(z.undefined()).catch(undefined)),
        })

        const pageSize = 49
        const cursor = args.input.cursor ?? 0

        const page = pageSchema.parse(
          await spotify.playlists.getPlaylistItems(
            args.input.playlistId,
            undefined,
            "items(track(name,artists(name)))",
            pageSize,
            cursor,
          ),
        )

        const limit = pLimit(5)
        const results = await Promise.all(
          page.items.filter(isNonNil).map(async (item) => {
            const query = [
              item.track.name,
              ...item.track.artists.map((a) => a.name),
            ].join(" ")
            const videos = await limit(() => searchYouTube(query))
            return { item, videos }
          }),
        )

        return {
          results,
          nextCursor:
            page.items.length === pageSize ? cursor + pageSize : undefined,
        }
      }),
  }),
})

const isNonNil = <T>(value: T): value is NonNullable<T> => value != null

export type AppRouter = typeof appRouter
export type AppRouterOutput = inferRouterOutputs<AppRouter>

const authResponseSchema = z.object({
  token: z.string(),
  user: userSchema,
})
