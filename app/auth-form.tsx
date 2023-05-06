"use client"
import { UserPlus } from "lucide-react"
import { useAction } from "./use-server-action"

export function AuthForm({
  title,
  buttonText,
  buttonTextPending,
  footer,
  submit,
}: {
  title: string
  buttonText: string
  buttonTextPending: string
  footer?: React.ReactNode
  submit: (form: FormData) => Promise<{ error: string }>
}) {
  const action = useAction(submit)
  return (
    <form
      className="panel container max-w-sm flex flex-col p-4 gap-4 border mt-4 items-center"
      onSubmit={(event) => {
        event.preventDefault()
        action.run(new FormData(event.currentTarget))
      }}
    >
      <h1 className="text-3xl font-light">{title}</h1>
      <label className="w-full">
        <div className="text-sm font-medium leading-none mb-1">Username</div>
        <input
          name="username"
          type="text"
          placeholder="awesomeuser"
          className="input"
          required
        />
      </label>
      <label className="w-full">
        <div className="text-sm font-medium leading-none mb-1">Password</div>
        <input
          name="password"
          type="password"
          placeholder="•••••••"
          className="input"
          required
        />
      </label>
      <button className="button" disabled={action.pending}>
        <UserPlus className="w-5 h-5" aria-hidden />{" "}
        {action.pending ? buttonTextPending : buttonText}
      </button>
      {footer}
      {action.result?.error && (
        <p className="text-error-400 text-center">{action.result?.error}</p>
      )}
    </form>
  )
}
