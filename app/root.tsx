import { type LinksFunction, type V2_MetaFunction } from "@remix-run/node"
import { Links, LiveReload, Meta, Outlet, Scripts } from "@remix-run/react"
import { type ReactNode } from "react"
import background from "./assets/background.jpg"
import favicon from "./assets/favicon.png"
import { AuthForms } from "./components/auth-forms"
import { Header } from "./components/header"
import style from "./style.css"
import { TrpcProvider, trpc } from "./trpc/client"

export const meta: V2_MetaFunction = () => [{ title: "Turntable" }]

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: style },
  { rel: "icon", href: favicon },
]

export default function Root() {
  return (
    <TrpcProvider>
      <Document />
    </TrpcProvider>
  )
}

function Document() {
  return (
    <html
      lang="en"
      className="overflow-x-clip break-words bg-black text-gray-100 [word-break:break-word] selection:bg-accent-600/50"
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
        className="bg-cover bg-fixed bg-center"
        style={{ backgroundImage: `url(${background})` }}
      >
        <div className="relative isolate flex min-h-screen flex-col bg-black/50">
          <Header />
          <AuthGuard>
            <Outlet />
          </AuthGuard>
        </div>
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}

function AuthGuard({ children }: { children: ReactNode }) {
  const userQuery = trpc.auth.user.useQuery()
  if (userQuery.isLoading) return <p>Loading...</p>
  if (!userQuery.data) return <AuthForms />
  return children
}
