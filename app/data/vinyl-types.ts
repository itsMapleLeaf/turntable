import { z } from "zod"

export const userSchema = z.object({
  id: z.string(),
  username: z.string(),
  display_name: z.string(),
})
export type User = z.infer<typeof userSchema>

export const trackSchema = z.object({
  title: z.string(),
  duration: z.number(),
})
export type Track = z.output<typeof trackSchema>

export const roomSchema = z.object({
  id: z.string(),
  name: z.string(),
  currentTrack: trackSchema.nullish(),
  connections: z.array(userSchema),
})
export type Room = z.infer<typeof roomSchema>