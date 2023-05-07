import { Link } from "@remix-run/react"
import { Disc } from "lucide-react"
import { type Nullish } from "~/helpers/types"
import { type User } from "~/vinyl-api.server"
import { HeaderMenu } from "./header-menu"

export function Header({ user }: { user: Nullish<User> }) {
  return (
    <header className="panel sticky top-0 z-10 flex h-16 flex-row items-center border-b">
      <nav className="container flex flex-row items-center">
        <Link to="/" className="link">
          <Disc aria-hidden size={32} />
          <span className="sr-only">Home</span>
        </Link>
        <div className="flex flex-1 flex-row justify-end gap-4">
          {user && (
            <p className="text-right leading-none">
              <span className="text-sm opacity-75">Signed in as</span>
              <br />
              {user.display_name}
            </p>
          )}
          <HeaderMenu loggedIn={!!user} />
        </div>
      </nav>
    </header>
  )
}
