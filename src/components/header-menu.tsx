import * as Popover from "@radix-ui/react-popover"
import { LogOut, Menu } from "lucide-react"
import { useAuthContext } from "./auth-context"

export function HeaderMenu() {
  const auth = useAuthContext()
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
          <Popover.Close asChild>
            <button
              className="link flex flex-row items-center gap-2 px-3 py-2"
              onClick={auth.logout}
            >
              <LogOut aria-hidden className="h-5 w-5" /> Sign Out
            </button>
          </Popover.Close>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
