import { Link, useActionData } from "@remix-run/react"
import { ActionArgs, json, redirect } from "@vercel/remix"
import { zfd } from "zod-form-data"
import { AuthForm } from "~/components/auth-form"
import { vinylApi } from "~/vinyl-api.server"
import { vinylTokenCookie } from "~/vinyl-token-cookie"

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

  return redirect("/", {
    headers: {
      "Set-Cookie": await vinylTokenCookie.serialize(response.data.token),
    },
  })
}

export default function SignInPage() {
  const errorData = useActionData<typeof action>()
  return (
    <AuthForm
      title="Sign In"
      submitText="Sign in"
      submitTextPending="Signing in..."
      error={errorData?.error}
      footer={
        <p>
          Don&apos;t have an account?{" "}
          <Link to="/sign-up" className="link underline">
            Sign Up
          </Link>
        </p>
      }
    />
  )
}
