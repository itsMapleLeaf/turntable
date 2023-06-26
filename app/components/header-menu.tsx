import { LucideLogOut, LucideMenu } from "lucide-react"
import { Menu, MenuButton, MenuItemLink, MenuPanel } from "./menu"

export function HeaderMenu() {
  return (
    <Menu>
      <MenuButton>
        <LucideMenu aria-hidden className="h-6 w-6" />
        <span className="sr-only">Menu</span>
      </MenuButton>
      <MenuPanel>
        <MenuItemLink
          to="/sign-out"
          className="link flex flex-row items-center gap-2 px-3 py-2"
          label="Sign Out"
          icon={LucideLogOut}
        />
      </MenuPanel>
    </Menu>
  )
}
