import { Form } from "@remix-run/react"
import { LogIn } from "lucide-react"
import { usePendingSubmit } from "~/helpers/use-pending-submit"

export function AuthForm(props: {
  title: string
  submitText: string
  submitTextPending: string
  footer: React.ReactNode
  error: string | undefined
}) {
  const pending = usePendingSubmit()
  return (
    <Form
      method="POST"
      className="panel container max-w-sm flex flex-col p-4 gap-4 border mt-4 items-center"
    >
      <h1 className="text-3xl font-light">{props.title}</h1>
      <label className="w-full">
        <div className="text-sm font-medium leading-none mb-1">Username</div>
        <input
          name="username"
          type="text"
          placeholder="awesomeuser"
          className="input"
        />
      </label>
      <label className="w-full">
        <div className="text-sm font-medium leading-none mb-1">Password</div>
        <input
          name="password"
          type="password"
          placeholder="•••••••"
          className="input"
        />
      </label>
      <button className="button">
        <LogIn aria-hidden />{" "}
        {pending ? props.submitTextPending : props.submitText}
      </button>
      {props.footer}
      {props.error ? <p className="text-error-400">{props.error}</p> : null}
    </Form>
  )
}
