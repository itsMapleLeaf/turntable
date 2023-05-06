import * as Popover from "@radix-ui/react-popover"
import { Link } from "@remix-run/react"
import { ListPlus, Menu } from "lucide-react"

export function HeaderMenu() {
  return (
    <Popover.Root>
      <Popover.Trigger className="link p-1">
        <Menu aria-hidden className="w-6 h-6" />
        <span className="sr-only">Menu</span>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="panel border radix-fade-zoom-transition duration-100 flex flex-col"
          align="start"
          sideOffset={4}
        >
          <Popover.Close asChild>
            <Link
              to="/rooms/new"
              className="link py-2 px-3 flex flex-row items-center gap-2"
            >
              <ListPlus aria-hidden className="w-6 h-6" /> New Room
            </Link>
          </Popover.Close>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
