import { useCallback, useEffect, useState } from "react"

type AsyncState<T> =
  | { status: "idle" }
  | { status: "pending" }
  | { status: "success"; data: Awaited<T> }
  | { status: "error"; error: unknown }

export function useAsync<T>(callback: () => T) {
  const [state, setState] = useState<AsyncState<T>>({ status: "idle" })

  const run = useCallback(() => {
    setState({ status: "pending" })
    Promise.resolve(callback())
      .then((data) => setState({ status: "success", data }))
      .catch((error: unknown) => setState({ status: "error", error }))
  }, [callback])

  useEffect(run, [run])

  return [state, run] as const
}
