import { LRUCache } from "lru-cache"
import { Scraper, type Video } from "scraper-edge"
import { delay } from "../helpers/delay"
export { type Video } from "scraper-edge"

const yt = new Scraper()

export type YouTubeResult<T> =
  | { data: T; error?: null }
  | { data?: null; error: string }

const searchCache = new LRUCache<string, Video[]>({
  max: 100,
  ttl: 1000 * 60 * 5,
})

export async function searchYouTube(query: string): Promise<Video[]> {
  const cached = searchCache.get(query)
  if (cached) return cached

  const results = await Promise.race([
    yt.search(query, { searchType: "VIDEO", language: "en" }),
    delay(10_000).then(() => {
      throw new Error("Timed out")
    }),
  ])
  searchCache.set(query, results.videos)
  return results.videos
}
