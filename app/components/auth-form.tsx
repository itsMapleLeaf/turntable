import { Form } from "@remix-run/react"
import { useNavigationPending } from "~/helpers/use-navigation-pending"

export function AuthForm(props: {
  title: string
  submitText: string
  submitTextPending: string
  error: string | undefined
}) {
  const pending = useNavigationPending()
  return (
    <Form method="POST">
      <h1>{props.title}</h1>
      <label>
        Username
        <input type="text" name="username" placeholder="awesomeuser" />
      </label>
      <label>
        Password
        <input type="password" name="password" placeholder="••••••••" />
      </label>
      <button type="submit">
        {pending ? props.submitTextPending : props.submitText}
      </button>
      {props.error && <p>{props.error}</p>}
    </Form>
  )
}
