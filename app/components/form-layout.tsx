import { Form } from "@remix-run/react"
import { type Nullish } from "~/helpers/types"

export type FormLayoutProps = {
  title: string
  children: React.ReactNode
  error: Nullish<string>
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}

export function FormLayout({
  title,
  children,
  error,
  onSubmit,
}: FormLayoutProps) {
  return (
    <main className="container py-4">
      <Form
        onSubmit={(event) => {
          event.preventDefault()
          onSubmit?.(event)
        }}
        className="panel container mt-4 flex max-w-sm flex-col items-center gap-4 border p-4"
      >
        <h1 className="text-3xl font-light">{title}</h1>
        {children}
        {error ? <p className="text-error-400">{error}</p> : null}
      </Form>
    </main>
  )
}
