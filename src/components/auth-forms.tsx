import { useState } from "react"
import { AuthForm } from "~/components/auth-form"
import { vinylApi } from "~/data/vinyl-api"
import { createSession } from "~/data/vinyl-session"

export function AuthForms(props: { onSuccess: () => void }) {
  const [view, setView] = useState<"signin" | "register">("signin")
  return view === "signin"
    ? (
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
    )
    : (
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
