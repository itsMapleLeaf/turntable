import { parse } from "@conform-to/zod"
import { Link, useActionData, useSearchParams } from "@remix-run/react"
import { json, redirect, type ActionArgs } from "@vercel/remix"
import { z } from "zod"
import { AuthForm } from "~/components/auth-form"
import { vinylApi } from "~/data/vinyl-api.server"
import { createSession } from "~/data/vinyl-session"

const schema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
})

export async function action({ request }: ActionArgs) {
  const submission = parse(await request.formData(), {
    schema,
  })
  if (!submission.value) {
    return json({ error: submission.error }, 400)
  }

  const response = await vinylApi(request).login(submission.value)
  if (!response.data) {
    return json({ error: response.error }, 400)
  }

  const destination = new URL(request.url).searchParams.get("redirect")
  return redirect(destination || "/", {
    headers: {
      "Set-Cookie": await createSession(response.data.token),
    },
  })
}

export default function SignInPage() {
  const errorData = useActionData<typeof action>()
  const [searchParams] = useSearchParams()
  return (
    <AuthForm
      title="Sign In"
      submitText="Sign in"
      submitTextPending="Signing in..."
      error={errorData?.error}
      footer={
        <p>
          Don&apos;t have an account?{" "}
          <Link
            to={`/sign-up?redirect=${searchParams.get("redirect") || "/"}`}
            className="link underline"
          >
            Sign Up
          </Link>
        </p>
      }
    />
  )
}
