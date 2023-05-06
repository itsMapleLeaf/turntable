import { Disc, UserPlus } from "lucide-react"
import Link from "next/link"
import { HeaderMenu } from "./header-menu"

export function Header() {
  return (
    <header className="h-16 flex flex-row items-center panel border-b sticky top-0 z-10">
      <nav className="container flex flex-row items-center">
        <div className="flex-1 flex flex-row">
          <HeaderMenu />
        </div>

        <Link href="/" className="link">
          <Disc aria-hidden size={32} />
          <span className="sr-only">Home</span>
        </Link>

        <div className="flex-1 flex flex-row justify-end">
          <Link href="/sign-up" className="button">
            <UserPlus className="w-5 h-5" aria-hidden /> Sign up
          </Link>
        </div>
      </nav>
    </header>
  )
}
