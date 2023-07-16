import { useQueryClient } from "@tanstack/react-query"
import { LogIn, UserPlus } from "lucide-react"
import { useState } from "react"
import { Button } from "~/components/button"
import { FormLayout } from "~/components/form-layout"
import { Label } from "~/components/label"
import { trpc } from "~/trpc/client"

export function AuthForms() {
  const [view, setView] = useState<"login" | "register">("login")
  return view === "login" ? (
    <SignInForm onRegister={() => setView("register")} />
  ) : (
    <RegisterForm onLogin={() => setView("login")} />
  )
}

function SignInForm({ onRegister }: { onRegister: () => void }) {
  const client = useQueryClient()
  const mutation = trpc.auth.login.useMutation({
    onSuccess: () => client.invalidateQueries(),
  })
  return (
    <FormLayout
      title="Sign In"
      error={mutation.error?.message}
      onSubmit={(event) => {
        const form = new FormData(event.currentTarget)
        mutation.mutate({
          username: form.get("username") as string,
          password: form.get("password") as string,
        })
      }}
    >
      <Label text="Username">
        <input
          name="username"
          type="text"
          placeholder="awesomeuser"
          className="input"
          required
        />
      </Label>
      <Label text="Password">
        <input
          name="password"
          type="password"
          placeholder="•••••••"
          className="input"
          required
        />
      </Label>
      <Button
        pending={mutation.isLoading}
        label="Sign in"
        pendingLabel="Signing in..."
        iconElement={<LogIn />}
        element={<button type="submit" name="action" value="login" />}
      />
      <p>
        Don't have an account?{" "}
        <button
          type="button"
          className="link inline-flex items-center gap-2 underline"
          onClick={onRegister}
        >
          Create one
        </button>
      </p>
    </FormLayout>
  )
}

function RegisterForm({ onLogin }: { onLogin: () => void }) {
  const client = useQueryClient()
  const mutation = trpc.auth.register.useMutation({
    onSuccess: () => client.invalidateQueries(),
  })
  return (
    <FormLayout
      title="Register"
      error={mutation.error?.message}
      onSubmit={(event) => {
        const form = new FormData(event.currentTarget)
        mutation.mutate({
          username: form.get("username") as string,
          password: form.get("password") as string,
          passwordRepeat: form.get("passwordRepeat") as string,
        })
      }}
    >
      <Label text="Username">
        <input
          name="username"
          type="text"
          placeholder="awesomeuser"
          className="input"
          required
        />
      </Label>
      <Label text="Password">
        <input
          name="password"
          type="password"
          placeholder="•••••••"
          className="input"
          required
        />
      </Label>
      <Label text="Confirm Password">
        <input
          name="passwordRepeat"
          type="password"
          placeholder="•••••••"
          className="input"
          required
        />
      </Label>
      <Button
        pending={mutation.isLoading}
        label="Register"
        pendingLabel="Registering..."
        iconElement={<UserPlus />}
        element={<button type="submit" name="action" value="register" />}
      />
      <p>
        Already have an account?{" "}
        <button
          type="button"
          className="link inline-flex items-center gap-2 underline"
          onClick={onLogin}
        >
          Sign in
        </button>
      </p>
    </FormLayout>
  )
}
