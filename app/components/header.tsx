import { Link } from "@remix-run/react"
import { Disc } from "lucide-react"
import { Nullish } from "~/helpers/types"
import { User } from "~/vinyl-api.server"
import { HeaderMenu } from "./header-menu"

export function Header({ user }: { user: Nullish<User> }) {
  return (
    <header className="h-16 flex flex-row items-center panel border-b sticky top-0 z-10">
      <nav className="container flex flex-row items-center">
        <Link to="/" className="link">
          <Disc aria-hidden size={32} />
          <span className="sr-only">Home</span>
        </Link>
        <div className="flex-1 flex flex-row justify-end gap-4">
          {user && (
            <p className="leading-none text-right">
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
