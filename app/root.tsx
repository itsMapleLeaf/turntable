import {
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  useLoaderData,
} from "@remix-run/react"
import type { LoaderArgs } from "@vercel/remix"
import { vinylApi } from "./vinyl-api.server"

export async function loader({ request }: LoaderArgs) {
  const api = vinylApi(request)
  const user = await api.getUser()
  return user.data ? { user } : { user: null }
}

export default function Root() {
  const { user } = useLoaderData<typeof loader>()
  return (
    <html lang="en">
      <head>
        <Links />
        <Meta />
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Turntable</title>
      </head>
      <body>
        <nav>
          {user ? (
            <Link to="/sign-out">Sign out</Link>
          ) : (
            <>
              <Link to="/sign-in">Sign in</Link> |{" "}
              <Link to="/sign-up">Sign up</Link>
            </>
          )}
        </nav>
        <Outlet />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
