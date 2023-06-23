import { Suspense, useState } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { vinylApi } from "../data/vinyl-api"
import { createSession, destroySession } from "../data/vinyl-session"
import { AuthForm } from "./auth-form"
import { Await } from "./await"
import { Spinner } from "./spinner"

export function App() {
  const [userPromise, setUserPromise] = useState(() =>
    vinylApi.getUser().catch(() => undefined),
  )
  return (
    <ErrorBoundary fallback={<p>shit hit the fan lol</p>}>
      <Suspense fallback={<Spinner />}>
        <Await promise={userPromise}>
          {(user) =>
            user ? (
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
            ) : (
              <AuthForms
                onSuccess={() => {
                  setUserPromise(vinylApi.getUser().catch(() => undefined))
                }}
              />
            )
          }
        </Await>
      </Suspense>
    </ErrorBoundary>
  )
}

function AuthForms(props: { onSuccess: () => void }) {
  const [view, setView] = useState<"signin" | "register">("signin")
  return view === "signin" ? (
    <AuthForm
      title="Sign In"
      submitText="Sign in"
      submitTextPending="Signing in..."
      onSubmit={async (data) => {
        const result = await vinylApi.login(data)
        createSession(result.token)
        props.onSuccess()
      }}
      footer={
        <p>
          Don&apos;t have an account?{" "}
          <button
            type="button"
            className="link underline"
            onClick={() => setView("register")}
          >
            Register
          </button>
        </p>
      }
    />
  ) : (
    <AuthForm
      title="Register"
      submitText="Register"
      submitTextPending="Registering..."
      onSubmit={async (data) => {
        const result = await vinylApi.register(data)
        createSession(result.token)
        props.onSuccess()
      }}
      footer={
        <p>
          Already have an account?{" "}
          <button
            type="button"
            className="link underline"
            onClick={() => setView("signin")}
          >
            Sign In
          </button>
        </p>
      }
    />
  )
}
