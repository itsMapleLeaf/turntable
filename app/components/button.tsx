import {
  type ComponentPropsWithoutRef,
  type ForwardedRef,
  forwardRef,
  type ReactElement,
  type ReactNode,
} from "react"
import { Slot } from "./slot"
import { Spinner } from "./spinner"

export const Button = forwardRef(function Button({
  pending,
  label,
  pendingLabel = label,
  element = <button />,
  iconElement,
  ...props
}: {
  pending?: boolean
  label?: ReactNode
  pendingLabel?: ReactNode
  element?: ReactElement
  iconElement?: ReactElement
} & ComponentPropsWithoutRef<"button">, ref: ForwardedRef<HTMLButtonElement>) {
  return (
    // TODO: use slot from radix ui
    <Slot {...props} element={element} className="button" disabled={pending} ref={ref}>
      {pending && <Spinner size={5} />}
      {iconElement && !pending && <Slot element={iconElement} className="h-5 w-5" aria-hidden />}
      {pending ? pendingLabel : label}
    </Slot>
  )
})
