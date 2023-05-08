import { z } from "zod"
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
  let socket: WebSocket | undefined

  function connect() {
    socket = new WebSocket(url)
    socket.addEventListener("message", handleMessage)
    socket.addEventListener("close", handleClose)
    socket.addEventListener("error", handleError)
  }

  function handleMessage(event: MessageEvent) {
    try {
      const result = socketMessageSchema.safeParse(
        JSON.parse(event.data as string),
      )
      if (result.success) {
        onMessage(result.data)
      } else {
        console.error("Unknown socket message:", result.error)
      }
    } catch (error) {
      console.error("Failed to parse socket message:", error)
    }
  }

  function handleClose() {
    setTimeout(connect, 1000)
  }

  function handleError() {
    setTimeout(connect, 1000)
  }

  connect()

  return () => {
    socket?.removeEventListener("message", handleMessage)
    socket?.removeEventListener("close", handleClose)
    socket?.removeEventListener("error", handleError)
    socket?.close()
  }
}
