import * as Popover from "@radix-ui/react-popover"
import { Link } from "@remix-run/react"
import { ListPlus, LogIn, LogOut, Menu, UserPlus } from "lucide-react"

export function HeaderMenu({ loggedIn }: { loggedIn: boolean }) {
  return (
    <Popover.Root>
      <Popover.Trigger className="link p-1">
        <Menu aria-hidden className="w-6 h-6" />
        <span className="sr-only">Menu</span>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="panel border radix-fade-zoom-transition duration-100 flex flex-col"
          align="end"
          sideOffset={8}
        >
          <Popover.Close asChild>
            <Link
              to="/rooms/new"
              className="link py-2 px-3 flex flex-row items-center gap-2"
            >
              <ListPlus aria-hidden className="w-5 h-5" /> New Room
            </Link>
          </Popover.Close>
          {loggedIn ? (
            <Popover.Close asChild>
              <Link
                to="/sign-out"
                className="link py-2 px-3 flex flex-row items-center gap-2"
              >
                <LogOut aria-hidden className="w-5 h-5" /> Sign Out
              </Link>
            </Popover.Close>
          ) : (
            <>
              <Popover.Close asChild>
                <Link
                  to="/sign-in"
                  className="link py-2 px-3 flex flex-row items-center gap-2"
                >
                  <LogIn aria-hidden className="w-5 h-5" /> Sign In
                </Link>
              </Popover.Close>
              <Popover.Close asChild>
                <Link
                  to="/sign-up"
                  className="link py-2 px-3 flex flex-row items-center gap-2"
                >
                  <UserPlus aria-hidden className="w-5 h-5" /> Sign Up
                </Link>
              </Popover.Close>
            </>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
