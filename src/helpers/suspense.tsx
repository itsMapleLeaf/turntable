type PromiseState =
  | { status: "pending" }
  | { status: "error"; error: unknown }
  | { status: "success"; data: unknown }

const cache = new Map<unknown, PromiseState>()

export function suspend<T>(input: T) {
  const state = cache.get(input)

  if (!state) {
    cache.set(input, { status: "pending" })
    throw Promise.resolve(input).then(
      (data) => {
        cache.set(input, { status: "success", data })
      },
      (error: unknown) => {
        cache.set(input, { status: "error", error })
      },
    )
  }

  if (state.status === "pending") throw input
  if (state.status === "error") throw state.error
  return state.data as Awaited<T>
}

export function Await<T>(props: {
  promise: T
  then: (value: Awaited<T>) => React.ReactNode
}) {
  return <>{props.then(suspend(props.promise))}</>
}
