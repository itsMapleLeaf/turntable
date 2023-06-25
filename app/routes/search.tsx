import { useFetcher } from "@remix-run/react"
import { json, type LoaderArgs, type TypedResponse } from "@vercel/remix"
import { searchYouTube, type Video, type YouTubeResult } from "~/data/youtube.server"

export async function loader({
  request,
}: LoaderArgs): Promise<TypedResponse<YouTubeResult<Video[]>>> {
  const url = new URL(request.url)
  const query = url.searchParams.get("query")?.trim()
  if (!query) return json({ data: [] })
  return json(await searchYouTube(query))
}

export function useSearchFetcher() {
  const fetcher = useFetcher<typeof loader>()

  const load = (query: string) => {
    fetcher.load(`/search?query=${query.trim()}`)
  }

  return { ...fetcher, load }
}

export type SearchFetcher = ReturnType<typeof useSearchFetcher>
