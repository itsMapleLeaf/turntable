import { vinylApi } from "./data/vinyl-api"

// eslint-disable-next-line unicorn/prefer-top-level-await
const userPromise = vinylApi.getUser().catch(() => "hehe")

export function App() {
  const user = suspend(userPromise)
  return (
    <div className="relative isolate flex min-h-screen flex-col bg-black/50">
      <h1>welcome to turntable</h1>
      {JSON.stringify(user)}
    </div>
  )
}

type SuspendState =
  | { status: "pending" }
  | { status: "error"; error: unknown }
  | { status: "success"; data: unknown }

const cache = new Map<Promise<unknown>, SuspendState>()

function suspend<T>(promise: Promise<T>) {
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
