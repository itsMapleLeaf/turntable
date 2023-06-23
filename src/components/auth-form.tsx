import { FormLayout, type FormLayoutProps } from "./form-layout"
import { Label } from "./label"

export function AuthForm({
  footer,
  onSubmit,
  ...props
}: Omit<FormLayoutProps, "children" | "onSubmit"> & {
  footer: React.ReactNode
  onSubmit: (data: { username: string; password: string }) => unknown
}) {
  return (
    <FormLayout
      {...props}
      onSubmit={(event) => {
        const form = new FormData(event.currentTarget)
        const username = form.get("username") as string
        const password = form.get("password") as string
        return onSubmit({ username, password })
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
      {footer}
    </FormLayout>
  )
}
