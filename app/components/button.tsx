import { type ReactElement, type ReactNode } from "react"
import { Slot } from "./slot"
import { Spinner } from "./spinner"

export function Button({
  pending,
  label,
  pendingLabel = label,
  element = <button />,
  iconElement,
}: {
  pending?: boolean
  label: ReactNode
  pendingLabel?: ReactNode
  element?: ReactElement
  iconElement?: ReactElement
}) {
  return (
    <Slot element={element} className="button" disabled={pending}>
      {pending && <Spinner size={5} />}
      {iconElement && !pending && <Slot element={iconElement} className="h-5 w-5" aria-hidden />}
      {pending ? pendingLabel : label}
    </Slot>
  )
}
