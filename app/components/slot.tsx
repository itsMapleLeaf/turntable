import clsx from "clsx"
import {
  cloneElement,
  type ForwardedRef,
  forwardRef,
  type ReactElement,
} from "react"

export const Slot = forwardRef(function Slot(
  {
    element,
    className,
    ...props
  }: {
    element: ReactElement
    className?: string
  } & Record<string, unknown>,
  ref: ForwardedRef<Element>,
) {
  const elementProps = element.props as Record<string, unknown>

  const innerClassName =
    typeof elementProps.className === "string" ? elementProps.className : ""

  return cloneElement(element, {
    ...props,
    ref,
    className: clsx(className, innerClassName),
  })
})
