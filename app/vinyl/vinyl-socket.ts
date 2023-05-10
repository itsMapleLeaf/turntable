import { z } from "zod"
import { delay } from "~/helpers/delay"
import { socket } from "~/helpers/socket"
import { trackSchema } from "./vinyl-types"

const socketMessageSchema = z.union([
  z.object({
    type: z.literal("user-entered-room"),
    user: z.object({
      id: z.string(),
      username: z.string(),
      display_name: z.string(),
    }),
    room: z.string(),
  }),
  z.object({
    type: z.literal("user-left-room"),
    user: z.string(),
    room: z.string(),
  }),
  z.object({
    type: z.literal("track-update"),
    track: trackSchema,
  }),
  z.object({
    type: z.literal("queue-add"),
    user: z.string(),
    track: trackSchema,
  }),
  z.object({
    type: z.literal("player-time"),
    seconds: z.number(),
  }),
])
type SocketMessage = z.output<typeof socketMessageSchema>

export function vinylSocket({
  url,
  onMessage,
}: {
  url: string
  onMessage: (message: SocketMessage) => void
}) {
  const controller = new AbortController()
  let running = true

  async function run() {
    while (running) {
      try {
        const connection = await socket(url, { signal: controller.signal })
        console.info("Connected to socket")

        for await (const event of connection) {
          try {
            const result = socketMessageSchema.safeParse(JSON.parse(event.data))
            if (result.success) {
              onMessage(result.data)
            } else {
              console.error("Unknown socket message:", result.error)
            }
          } catch (error) {
            console.error("Failed to parse socket message:", error)
          }
        }

        console.info("Socket closed")
      } catch (error) {
        console.error("Failed to connect to socket:", error)
      }

      if (running) {
        console.info("Reconnecting...")
        await delay(2000)
      }
    }
  }

  void run()

  return () => {
    running = false
    controller.abort()
  }
}
