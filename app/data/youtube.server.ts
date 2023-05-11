import { Scraper, type Video } from "@yimura/scraper"
import { delay } from "../helpers/delay"
export { type Video } from "@yimura/scraper"

const yt = new Scraper()

export type YouTubeResult<T> =
  | { data: T; error?: null }
  | { data?: null; error: string }

export async function searchYouTube(
  query: string,
): Promise<YouTubeResult<Video[]>> {
  try {
    const results = await Promise.race([
      yt.search(query, { searchType: "VIDEO" }),
      delay(10_000).then(() => {
        throw new Error("Timed out")
      }),
    ])
    return { data: results.videos }
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? `YouTube search failed: ${error.message}`
          : "YouTube search failed",
    }
  }
}
