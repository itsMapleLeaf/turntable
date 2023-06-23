import { Wand2 } from "lucide-react"
import { toError } from "~/helpers/errors"
import { useAsyncCallback } from "~/helpers/use-async-callback"
import { Button } from "./button"

export type FormLayoutProps = {
  title: string
  children: React.ReactNode
  submitText: string
  submitTextPending: string
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => unknown
}

export function FormLayout({
  title,
  children,
  submitText,
  submitTextPending,
  onSubmit,
}: FormLayoutProps) {
  const submit = useAsyncCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      await onSubmit(event)
    },
  )

  return (
    <main className="container py-4">
      <form
        className="panel container mt-4 flex max-w-sm flex-col items-center gap-4 border p-4"
        onSubmit={submit}
      >
        <h1 className="text-3xl font-light">{title}</h1>
        {children}
        <Button
          label={submitText}
          pending={submit.loading}
          pendingLabel={submitTextPending}
          iconElement={<Wand2 />}
        />
        {submit.error ? (
          <p className="text-error-400">{toError(submit.error).message}</p>
        ) : null}
      </form>
    </main>
  )
}
