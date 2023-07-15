import { LucideLogOut, LucideMenu } from "lucide-react"
import { trpc } from "~/trpc/client"
import { Menu, MenuButton, MenuItemButton, MenuPanel } from "./menu"

export function HeaderMenu() {
  const mutation = trpc.auth.logout.useMutation()
  return (
    <Menu>
      <MenuButton>
        <LucideMenu aria-hidden className="h-6 w-6" />
        <span className="sr-only">Menu</span>
      </MenuButton>
      <MenuPanel>
        <MenuItemButton
          label="Sign Out"
          icon={LucideLogOut}
          onClick={() => mutation.mutate()}
        />
      </MenuPanel>
    </Menu>
  )
}
