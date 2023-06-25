import { type ReactElement } from "react"
import { Slot } from "./slot"

export function Button({
  pending,
  label,
  pendingLabel = label,
  element = <button />,
  iconElement,
}: {
  pending?: boolean
  label: string
  pendingLabel?: string
  element?: ReactElement
  iconElement?: ReactElement
}) {
  return (
    <Slot element={element} className="button" disabled={pending}>
      {iconElement && <Slot element={iconElement} className="h-5 w-5" aria-hidden />}
      {pending ? pendingLabel : label}
    </Slot>
  )
}
