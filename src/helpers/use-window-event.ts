import { useEffect } from "react"

export function useWindowEvent<E extends keyof WindowEventMap>(
  event: E,
  callback: (event: WindowEventMap[E]) => void,
  options?: boolean | AddEventListenerOptions,
) {
  useEffect(() => {
    window.addEventListener(event, callback, options)
    return () => window.removeEventListener(event, callback, options)
  })
}
