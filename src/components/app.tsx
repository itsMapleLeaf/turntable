import { Suspense, useState } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { vinylApi } from "../data/vinyl-api"
import { destroySession } from "../data/vinyl-session"
import { AuthForms } from "./auth-forms"
import { Await } from "./await"
import { Spinner } from "./spinner"

export function App() {
  const [userPromise, setUserPromise] = useState(() => vinylApi.getUser().catch(() => undefined))
  return (
    <ErrorBoundary fallback={<p>shit hit the fan lol</p>}>
      <Suspense fallback={<Spinner />}>
        <Await promise={userPromise}>
          {(user) =>
            user
              ? (
                <main>
                  <h1>welcome to turntable</h1>
                  {JSON.stringify(user)}
                  <button
                    type="button"
                    onClick={() => {
                      destroySession()
                      setUserPromise(Promise.resolve(undefined))
                    }}
                  >
                    sign out
                  </button>
                </main>
              )
              : (
                <AuthForms
                  onSuccess={() => {
                    setUserPromise(vinylApi.getUser().catch(() => undefined))
                  }}
                />
              )}
        </Await>
      </Suspense>
    </ErrorBoundary>
  )
}
