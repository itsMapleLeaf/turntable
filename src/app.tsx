import { useState } from "react"
import { AuthForm } from "./components/auth-form"
import { vinylApi } from "./data/vinyl-api"
import { createSession, destroySession } from "./data/vinyl-session"
import { suspend } from "./suspense"

// eslint-disable-next-line unicorn/prefer-top-level-await
const userPromise = vinylApi.getUser().catch(() => undefined)

export function App() {
  const user = suspend(userPromise)
  return user ? (
    <main>
      <h1>welcome to turntable</h1>
      {JSON.stringify(user)}
      <button
        type="button"
        onClick={() => {
          destroySession()
          location.reload()
        }}
      >
        sign out
      </button>
    </main>
  ) : (
    <AuthForms />
  )
}

function AuthForms() {
  const [view, setView] = useState<"signin" | "register">("signin")
  return view === "signin" ? (
    <AuthForm
      title="Sign In"
      submitText="Sign in"
      submitTextPending="Signing in..."
      onSubmit={async (data) => {
        const result = await vinylApi.login(data)
        createSession(result.token)
        location.reload()
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
        location.reload()
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
