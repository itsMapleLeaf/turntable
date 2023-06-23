import clsx from "clsx"
import { cloneElement, type ReactElement } from "react"

export function Slot({
  element,
  className,
  ...props
}: {
  element: ReactElement
  className?: string
} & Record<string, unknown>) {
  const elementProps = element.props as Record<string, unknown>

  const innerClassName = typeof elementProps.className === "string" ? elementProps.className : ""

  return cloneElement(element, {
    ...props,
    className: clsx(className, innerClassName),
  })
}
