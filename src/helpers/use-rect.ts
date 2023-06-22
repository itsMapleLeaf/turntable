import { type RefObject, useEffect, useState } from "react"

export function useRect(ref: RefObject<HTMLElement>) {
  const [rect, setRect] = useState<DOMRect>()

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new ResizeObserver(([info]) => {
      if (info) setRect(info.target.getBoundingClientRect())
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref])

  return rect
}
