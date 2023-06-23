import { Scraper, type Video } from "scraper-edge"
import { Cache } from "~/helpers/cache"
import { delay } from "../helpers/delay"
export { type Video } from "scraper-edge"

const yt = new Scraper()

export type YouTubeResult<T> =
  | { data: T; error?: null }
  | { data?: null; error: string }

const searchCache = new Cache<Video[]>({
  maxSize: 100,
  expiryTime: 1000 * 60 * 5,
})

export async function searchYouTube(
  query: string,
): Promise<YouTubeResult<Video[]>> {
  const cached = searchCache.get(query)
  if (cached) return { data: cached }

  try {
    const results = await Promise.race([
      yt.search(query, { searchType: "VIDEO", language: "en" }),
      delay(10_000).then(() => {
        throw new Error("Timed out")
      }),
    ])
    searchCache.set(query, results.videos)
    return { data: results.videos }
  } catch (error) {
    return {
      error: error instanceof Error
        ? `YouTube search failed: ${error.message}`
        : "YouTube search failed",
    }
  }
}
