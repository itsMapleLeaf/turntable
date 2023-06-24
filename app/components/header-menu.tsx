import * as Popover from "@radix-ui/react-popover"
import { Link } from "@remix-run/react"
import { LogIn, LogOut, Menu, UserPlus } from "lucide-react"

export function HeaderMenu({ loggedIn }: { loggedIn: boolean }) {
  return (
    <Popover.Root>
      <Popover.Trigger className="link p-1">
        <Menu aria-hidden className="h-6 w-6" />
        <span className="sr-only">Menu</span>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="panel radix-fade-zoom-transition flex flex-col border duration-100"
          align="end"
          sideOffset={8}
        >
          {/* playing things in multiple rooms kills vinyl */}
          {
            /* <Popover.Close asChild>
            <Link
              to="/rooms/new"
              className="link flex flex-row items-center gap-2 px-3 py-2"
            >
              <ListPlus aria-hidden className="h-5 w-5" /> New Room
            </Link>
          </Popover.Close> */
          }
          {loggedIn
            ? (
              <Popover.Close asChild>
                <Link
                  to="/sign-out"
                  className="link flex flex-row items-center gap-2 px-3 py-2"
                >
                  <LogOut aria-hidden className="h-5 w-5" /> Sign Out
                </Link>
              </Popover.Close>
            )
            : (
              <>
                <Popover.Close asChild>
                  <Link
                    to="/sign-in"
                    className="link flex flex-row items-center gap-2 px-3 py-2"
                  >
                    <LogIn aria-hidden className="h-5 w-5" /> Sign In
                  </Link>
                </Popover.Close>
                <Popover.Close asChild>
                  <Link
                    to="/sign-up"
                    className="link flex flex-row items-center gap-2 px-3 py-2"
                  >
                    <UserPlus aria-hidden className="h-5 w-5" /> Sign Up
                  </Link>
                </Popover.Close>
              </>
            )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
