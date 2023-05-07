import { FormLayout, FormLayoutProps } from "./form-layout"

export function AuthForm({
  footer,
  ...props
}: Omit<FormLayoutProps, "children"> & {
  footer: React.ReactNode
}) {
  return (
    <FormLayout {...props}>
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
      {footer}
    </FormLayout>
  )
}
