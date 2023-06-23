import { useState } from "react"
import { AuthForm } from "~/components/auth-form"
import { vinylApi } from "~/data/vinyl-api"
import { useAuthContext } from "./auth-context"

export function AuthForms() {
  const [view, setView] = useState<"signin" | "register">("signin")
  const auth = useAuthContext()

  return view === "signin"
    ? (
      <AuthForm
        title="Sign In"
        submitText="Sign in"
        submitTextPending="Signing in..."
        onSubmit={async (data) => {
          const result = await vinylApi.login(data)
          auth.login(result.token, result.user)
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
          auth.login(result.token, result.user)
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
