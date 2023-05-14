import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  useLoaderData,
} from "@remix-run/react"
import type { LinksFunction, LoaderArgs, V2_MetaFunction } from "@vercel/remix"
import background from "./assets/background.jpg"
import { Header } from "./components/header"
import { vinylApi } from "./data/vinyl-api.server"
import style from "./style.css"

export const meta: V2_MetaFunction = () => [{ title: "Turntable" }]

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
      className="break-words bg-black text-gray-100 [word-break:break-word] overflow-x-clip selection:bg-accent-600/50"
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
      <body
        className="bg-center bg-fixed bg-cover"
        style={{ backgroundImage: `url(${background})` }}
      >
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
