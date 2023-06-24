import { Await, Link } from "@remix-run/react"
import { Disc } from "lucide-react"
import { Suspense } from "react"
import { type VinylApiResult } from "~/data/vinyl-api.server"
import { type User } from "~/data/vinyl-types"
import { HeaderMenu } from "./header-menu"

export function Header({ user }: { user: Promise<VinylApiResult<User>> }) {
  return (
    <header className="panel sticky top-0 z-10 flex h-16 flex-row items-center border-b">
      <nav className="container flex flex-row items-center">
        <Link to="/" className="link">
          <Disc aria-hidden size={32} />
          <span className="sr-only">Home</span>
        </Link>
        <div className="flex flex-1 flex-row justify-end gap-4">
          <Suspense>
            <Await resolve={user}>
              {user =>
                <>
                  {user.data && (
                    <p className="text-right leading-none">
                      <span className="text-sm opacity-75">Signed in as</span>
                      <br />
                      {user.data.display_name}
                    </p>
                  )}
                  <HeaderMenu loggedIn={!!user.data} />
                </>}
            </Await>
          </Suspense>
        </div>
      </nav>
    </header>
  )
}
