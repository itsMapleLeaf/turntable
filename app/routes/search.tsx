import { type LoaderArgs, json } from "@remix-run/node"
import { searchYouTube } from "~/youtube"

export async function loader({ request }: LoaderArgs) {
  const url = new URL(request.url)
  const query = url.searchParams.get("query")?.trim()
  if (!query) return json({ data: { items: [] } })
  return json(await searchYouTube(query))
}
