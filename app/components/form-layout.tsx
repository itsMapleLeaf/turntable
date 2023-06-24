import { Form } from "@remix-run/react"
import { Wand2 } from "lucide-react"
import { type Nullish } from "~/helpers/types"
import { usePendingSubmit } from "~/helpers/use-pending-submit"
import { Button } from "./button"

export type FormLayoutProps = {
  title: string
  children: React.ReactNode
  submitText: string
  submitTextPending: string
  error: Nullish<string>
}

export function FormLayout({
  title,
  children,
  submitText,
  submitTextPending,
  error,
}: FormLayoutProps) {
  const pending = usePendingSubmit()
  return (
    <main className="container py-4">
      <Form
        method="POST"
        className="panel container mt-4 flex max-w-sm flex-col items-center gap-4 border p-4"
      >
        <h1 className="text-3xl font-light">{title}</h1>
        {children}
        <Button
          pending={pending}
          label={submitText}
          pendingLabel={submitTextPending}
          iconElement={<Wand2 />}
        />
        {error ? <p className="text-error-400">{error}</p> : null}
      </Form>
    </main>
  )
}