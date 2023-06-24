import { Link, useActionData, useSearchParams } from "@remix-run/react"
import { type ActionArgs, json, redirect } from "@vercel/remix"
import { zfd } from "zod-form-data"
import { AuthForm } from "~/components/auth-form"
import { vinylApi } from "~/data/vinyl-api.server"
import { createSession } from "~/data/vinyl-session"

export async function action({ request }: ActionArgs) {
  const form = zfd
    .formData({
      username: zfd.text(),
      password: zfd.text(),
    })
    .parse(await request.formData())

  const response = await vinylApi(request).register(form)

  if (!response.data) {
    return json({ error: response.error }, 400)
  }

  return redirect("/", {
    headers: {
      "Set-Cookie": await createSession(response.data.token),
    },
  })
}

export default function SignUpPage() {
  const errorData = useActionData<typeof action>()
  const [searchParams] = useSearchParams()
  return (
    <AuthForm
      title="Sign Up"
      submitText="Sign up"
      submitTextPending="Signing up..."
      error={errorData?.error}
      footer={
        <p>
          Already have an account?{" "}
          <Link
            to={`/sign-in?redirect=${searchParams.get("redirect") || "/"}`}
            className="link underline"
          >
            Sign In
          </Link>
        </p>
      }
    />
  )
}
