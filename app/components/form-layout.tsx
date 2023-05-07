import { Form } from "@remix-run/react"
import { Wand2 } from "lucide-react"
import { Nullish } from "~/helpers/types"
import { usePendingSubmit } from "~/helpers/use-pending-submit"

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
        className="panel container max-w-sm flex flex-col p-4 gap-4 border mt-4 items-center"
      >
        <h1 className="text-3xl font-light">{title}</h1>
        {children}
        <button className="button" disabled={pending}>
          <Wand2 aria-hidden /> {pending ? submitTextPending : submitText}
        </button>
        {error ? <p className="text-error-400">{error}</p> : null}
      </Form>
    </main>
  )
}
