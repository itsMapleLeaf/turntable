import { z } from "zod"
import { delay } from "~/helpers/delay"
import { resultify } from "~/helpers/result"
import { socket } from "~/helpers/socket"
import { queueItemSchema, userSchema } from "./vinyl-types"

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
    type: z.literal("queue-update"),
    room: z.string(),
    items: z.array(queueItemSchema),
    submitters: z.array(userSchema).nullish(),
  }),
  z.object({
    type: z.literal("queue-advance"),
    room: z.string(),
    item: queueItemSchema,
  }),
  z.object({
    type: z.literal("player-time"),
    room: z.string(),
    seconds: z.number(),
  }),
])
type SocketMessage = z.output<typeof socketMessageSchema>

export function vinylSocket({
  url,
  onConnect,
  onDisconnect,
  onMessage,
}: {
  url: string
  onConnect: () => void
  onDisconnect: () => void
  onMessage: (message: SocketMessage) => void
}) {
  const controller = new AbortController()
  let running = true

  async function run(): Promise<void> {
    if (!running) return

    const [connection, connectionError] = await resultify.promise(
      socket(url, { signal: controller.signal }),
    )
    if (!connection) {
      console.error("Failed to connect to socket:", connectionError)
      await delay(2000)
      return run()
    }

    console.info("Connected to socket")
    onConnect()

    for await (const event of connection) {
      const [json, jsonError] = resultify(() => JSON.parse(event.data))
      if (!json) {
        console.error("Failed to parse socket message JSON:", jsonError)
        continue
      }

      const messageResult = socketMessageSchema.safeParse(json)
      if (!messageResult.success) {
        console.error(
          "Failed to validate socket message:",
          messageResult.error.format(),
        )
        continue
      }

      onMessage(messageResult.data)
    }

    onDisconnect()

    console.info("Disconnected from socket. Reconnecting...")
    await delay(2000)
    return run()
  }

  void run()

  return () => {
    running = false
    controller.abort()
  }
}
