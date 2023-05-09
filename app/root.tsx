import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  useLoaderData,
} from "@remix-run/react"
import type { LinksFunction, LoaderArgs } from "@vercel/remix"
import background from "./assets/background.webp"
import { Header } from "./components/header"
import style from "./style.css"
import { vinylApi } from "./vinyl/vinyl-api.server"

export const links: LinksFunction = () => [{ rel: "stylesheet", href: style }]

export async function loader({ request }: LoaderArgs) {
  const api = vinylApi(request)
  const user = await api.getUser()
  return user.data ? { user: user.data } : { user: null }
}

export default function Root() {
  const { user } = useLoaderData<typeof loader>()
  return (
    <html
      lang="en"
      className="break-words bg-center text-gray-100 bg-blend-darken [word-break:break-word] overflow-x-clip"
      style={{ backgroundImage: `url(${background})` }}
    >
      <head>
        <Links />
        <Meta />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Turntable</title>

        <link rel="preconnect" href="https://fonts.googleapis.com"></link>
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        ></link>
        <link
          href="https://fonts.googleapis.com/css2?family=Pathway+Extreme:wght@300;400;500&display=swap"
          rel="stylesheet"
        ></link>
      </head>
      <body>
        <div className="relative isolate flex min-h-screen flex-col bg-black/50">
          <Header user={user} />
          <Outlet />
        </div>
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
