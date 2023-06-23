type PromiseState =
  | { status: "pending" }
  | { status: "error"; error: unknown }
  | { status: "success"; data: unknown }

const cache = new Map<Promise<unknown>, PromiseState>()

export function Await<T>(props: {
  promise: Promise<T>
  children: (data: T) => React.ReactNode
}) {
  const state = cache.get(props.promise)

  if (!state) {
    cache.set(props.promise, { status: "pending" })
    throw props.promise.then(
      (data) => {
        cache.set(props.promise, { status: "success", data })
      },
      (error: unknown) => {
        cache.set(props.promise, { status: "error", error })
      },
    )
  }

  if (state.status === "pending") throw props.promise
  if (state.status === "error") throw state.error
  return <>{props.children(state.data as T)}</>
}
