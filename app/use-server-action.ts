"use client"
import { useCallback, useState, useTransition } from "react"

export function useAction<T, Args extends unknown[]>(
  callback: (...args: Args) => T,
) {
  const [pending, startTransition] = useTransition()
  const [result, setResult] = useState<Awaited<T>>()

  const run = useCallback(
    (...args: Args) => {
      if (pending) return
      startTransition(async () => {
        setResult(await callback(...args))
      })
    },
    [callback, pending],
  )

  return { pending, result, run }
}
