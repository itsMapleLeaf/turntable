import { z } from "zod"
import { raise } from "./helpers/raise"

const apiKey =
  process.env.YOUTUBE_API_KEY ?? raise("YOUTUBE_API_KEY not defined")

const searchResultSchema = z.object({
  items: z.array(
    z.object({
      id: z.object({ videoId: z.string() }),
      snippet: z.object({
        title: z.string(),
        channelTitle: z.string(),
        thumbnails: z.object({
          default: z.object({ url: z.string() }),
        }),
      }),
    }),
  ),
})
export type SearchResult = z.infer<typeof searchResultSchema>

const errorSchema = z.object({
  error: z.object({
    code: z.number(),
    message: z.string(),
  }),
})

export type YouTubeResult<T> =
  | { data: T; error?: null }
  | { data?: null; error: string }

export async function searchYouTube(
  query: string,
): Promise<YouTubeResult<SearchResult>> {
  try {
    const youtubeSearchUrl = `https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=${query}&type=video&key=${apiKey}`

    const response = await fetch(youtubeSearchUrl)
    if (!response.ok) {
      const error = errorSchema.safeParse(await response.json())
      return {
        error: error.success
          ? `${error.data.error.code} ${error.data.error.message}`
          : `${response.status} ${response.statusText}`,
      }
    }

    const result = searchResultSchema.safeParse(await response.json())
    return result.success
      ? { data: result.data }
      : { error: result.error.message }
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? `YouTube search failed: ${error.message}`
          : "YouTube search failed",
    }
  }
}
