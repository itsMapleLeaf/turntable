import * as React from "react"

type AsyncCallbackState<T> =
  | { status: "idle"; data?: undefined; error?: undefined }
  | { status: "loading"; data?: undefined; error?: undefined }
  | { status: "success"; data: T; error?: undefined }
  | { status: "error"; data?: undefined; error: unknown }

export function useAsyncCallback<T, Args extends unknown[]>(
  fn: (...args: Args) => T,
) {
  const [state, setState] = React.useState<AsyncCallbackState<Awaited<T>>>({
    status: "idle",
  })

  function callback(...args: Args) {
    if (state.status === "loading") return
    setState({ status: "loading" })

    Promise.resolve(fn(...args))
      .then((data) => setState({ status: "success", data }))
      .catch((error: unknown) => setState({ status: "error", error }))
  }

  callback.state = state
  callback.loading = state.status === "loading"
  callback.data = state.status === "success" ? state.data : undefined
  callback.error = state.status === "error" ? state.error : undefined

  return callback
}
