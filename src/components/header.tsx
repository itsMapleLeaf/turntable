import { Disc } from "lucide-react"
import { useAuthContext } from "./auth-context"
import { HeaderMenu } from "./header-menu"

export function Header() {
  const auth = useAuthContext()
  return (
    <header className="panel sticky top-0 z-10 flex h-16 flex-row items-center border-b">
      <nav className="container flex flex-row items-center">
        <a href="/" className="link">
          <Disc aria-hidden size={32} />
          <span className="sr-only">Home</span>
        </a>
        <div className="flex flex-1 flex-row justify-end gap-4">
          {auth.user && (
            <p className="text-right leading-none">
              <span className="text-sm opacity-75">Signed in as</span>
              <br />
              {auth.user.display_name}
            </p>
          )}
          {auth.user && <HeaderMenu />}
        </div>
      </nav>
    </header>
  )
}
