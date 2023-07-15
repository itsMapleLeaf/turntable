import { z } from "zod"

export const userSchema = z.object({
  id: z.string(),
  username: z.string(),
  display_name: z.string(),
})
export type User = z.infer<typeof userSchema>

export const trackSchema = z.object({
  id: z.number(),
  metadata: z.object({
    title: z.string(),
    artist: z.string(),
    canonical: z.string(),
    source: z.string(),
    duration: z.number(),
    artwork: z.string().nullish(),
  }),
})
export type Track = z.output<typeof trackSchema>

export const queueItemSchema = z.object({
  id: z.number(),
  track: trackSchema,
  submitter: z.string(),
})
export type QueueItem = z.output<typeof queueItemSchema>

export const queueSchema = z.object({
  id: z.number(),
  items: z.array(queueItemSchema),
  currentItem: z.number().nullish(),
  submitters: z.array(userSchema),
})
export type Queue = z.output<typeof queueSchema>

export const roomSchema = z.object({
  id: z.string(),
  name: z.string(),
  currentTrack: trackSchema.nullish(),
  connections: z.array(userSchema),
})
export type Room = z.infer<typeof roomSchema>

export const vinylEventSchema = z.union([
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
export type VinylEvent = z.output<typeof vinylEventSchema>
