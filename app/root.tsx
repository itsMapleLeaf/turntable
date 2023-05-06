import { Links, Meta, Outlet } from "@remix-run/react"

export default function Root() {
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
        <Outlet />
      </body>
    </html>
  )
}
