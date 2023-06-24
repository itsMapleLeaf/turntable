import { ReconnectingEventSource } from "@jessestolwijk/reconnecting-event-source"
import { z } from "zod"
import { resultify } from "~/helpers/result"
import { queueItemSchema, userSchema } from "./vinyl-types"

const eventSchema = z.union([
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
    id: z.number(),
    currentItem: z.number(),
    items: z.array(queueItemSchema),
    submitters: z.array(userSchema),
  }),
  z.object({
    type: z.literal("queue-advance"),
    queue: z.number(),
    item: queueItemSchema,
  }),
  z.object({
    type: z.literal("player-time"),
    room: z.string(),
    seconds: z.number(),
    total_seconds: z.number(),
  }),
  z.object({
    type: z.literal("track-activation-error"),
    queue: z.number(),
    track: z.number(),
  }),
])
type VinylEvent = z.output<typeof eventSchema>

export function vinylEvents({
  url,
  onConnect,
  onDisconnect,
  onMessage,
}: {
  url: string
  onConnect: () => void
  onDisconnect: () => void
  onMessage: (message: VinylEvent) => void
}) {
  const source = new ReconnectingEventSource(url)

  source.onOpen = onConnect
  source.onError = onDisconnect
  source.onMessage = (event: MessageEvent<string>) => {
    const [json, jsonError] = resultify(() => JSON.parse(event.data))
    if (!json) {
      console.error("Failed to parse socket message JSON:", jsonError)
      return
    }

    const messageResult = eventSchema.safeParse(json)
    if (!messageResult.success) {
      console.error(
        "Failed to validate socket message. Received:",
        json,
        "Error",
        messageResult.error.message,
      )
      return
    }

    onMessage(messageResult.data)
  }

  return () => {
    source.close()
  }
}
