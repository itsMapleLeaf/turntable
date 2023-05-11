import { json, type LoaderArgs, type TypedResponse } from "@remix-run/node"
import { useFetcher } from "@remix-run/react"
import { useEffect } from "react"
import { useEffectEvent } from "~/helpers/use-effect-event"
import { searchYouTube, type Video, type YouTubeResult } from "~/youtube.server"

export async function loader({
  request,
}: LoaderArgs): Promise<TypedResponse<YouTubeResult<Video[]>>> {
  const url = new URL(request.url)
  const query = url.searchParams.get("query")?.trim()
  if (!query) return json({ data: [] })
  return json(await searchYouTube(query))
}

export function useSearchFetcher(queryArg: string) {
  const fetcher = useFetcher<typeof loader>()
  const query = queryArg.trim()

  const doSearch = useEffectEvent((query: string) => {
    fetcher.load(`/search?query=${query}`)
  })

  useEffect(() => doSearch(query), [doSearch, query])

  return fetcher
}

export type SearchFetcher = ReturnType<typeof useSearchFetcher>
