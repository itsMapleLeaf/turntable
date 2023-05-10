import { Scraper, type Video } from "@yimura/scraper"
export { type Video } from "@yimura/scraper"

const yt = new Scraper()

export type YouTubeResult<T> =
  | { data: T; error?: null }
  | { data?: null; error: string }

export async function searchYouTube(
  query: string,
): Promise<YouTubeResult<Video[]>> {
  try {
    const results = await yt.search(query, { searchType: "VIDEO" })
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
