type SuspendState =
  | { status: "pending" }
  | { status: "error"; error: unknown }
  | { status: "success"; data: unknown }

const cache = new Map<Promise<unknown>, SuspendState>()

export function suspend<T>(promise: Promise<T>) {
  const state = cache.get(promise)

  if (!state) {
    cache.set(promise, { status: "pending" })
    throw promise.then(
      (data) => {
        cache.set(promise, { status: "success", data })
      },
      (error: unknown) => {
        cache.set(promise, { status: "error", error })
      },
    )
  }

  if (state.status === "pending") throw promise
  if (state.status === "error") throw state.error
  return state.data as T
}
