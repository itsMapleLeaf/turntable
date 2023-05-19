import { FormLayout, type FormLayoutProps } from "./form-layout"
import { Label } from "./label"

export function AuthForm({
  footer,
  ...props
}: Omit<FormLayoutProps, "children"> & {
  footer: React.ReactNode
}) {
  return (
    <FormLayout {...props}>
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
