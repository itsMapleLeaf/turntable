import { Link, useActionData, useSearchParams } from "@remix-run/react"
import { json, redirect, type ActionArgs } from "@vercel/remix"
import { zfd } from "zod-form-data"
import { AuthForm } from "~/components/auth-form"
import { vinylApi } from "~/vinyl/vinyl-api.server"
import { createSession } from "~/vinyl/vinyl-session"

export async function action({ request }: ActionArgs) {
  const form = zfd
    .formData({
      username: zfd.text(),
      password: zfd.text(),
    })
    .parse(await request.formData())

  const response = await vinylApi(request).login(form)

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
