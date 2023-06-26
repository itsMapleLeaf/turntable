import * as Popover from "@radix-ui/react-popover"
import { Slot } from "@radix-ui/react-slot"
import { Link, type LinkProps } from "@remix-run/react"
import clsx from "clsx"
import { type LucideIcon } from "lucide-react"
import { type ComponentPropsWithoutRef, type ReactNode } from "react"

export function Menu({ children }: { children: React.ReactNode }) {
  return <Popover.Root>{children}</Popover.Root>
}

export function MenuButton({ children, asChild }: { children: ReactNode; asChild?: boolean }) {
  const Component = asChild ? Slot : "button"
  return (
    <Popover.Trigger asChild>
      <Component>{children}</Component>
    </Popover.Trigger>
  )
}

export function MenuPanel({ children }: { children: ReactNode }) {
  return (
    <Popover.Portal>
      <Popover.Content
        className="panel radix-fade-zoom-transition flex flex-col border duration-100"
        align="end"
        sideOffset={8}
      >
        {children}
      </Popover.Content>
    </Popover.Portal>
  )
}

export function MenuItemButton(
  props: ComponentPropsWithoutRef<"button"> & { label: ReactNode; icon: LucideIcon },
) {
  return (
    <Popover.Close
      {...props}
      className={clsx("link flex flex-row items-center gap-2 px-3 py-2", props.className)}
    >
      <props.icon className="w-5 h-5" aria-hidden /> {props.label}
    </Popover.Close>
  )
}

export function MenuItemLink(props: LinkProps & { label: ReactNode; icon: LucideIcon }) {
  return (
    <Popover.Close asChild>
      <Link
        {...props}
        className={clsx("link flex flex-row items-center gap-2 px-3 py-2", props.className)}
      >
        <props.icon className="w-5 h-5" aria-hidden /> {props.label}
      </Link>
    </Popover.Close>
  )
}
