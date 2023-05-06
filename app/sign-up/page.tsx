import { cookies } from "next/headers"
import Link from "next/link"
import { redirect } from "next/navigation"
import { AuthForm } from "../auth-form"
import { vinylApi } from "../vinyl-api"

async function signUp(form: FormData) {
  "use server"
  const result = await vinylApi().register(
    form.get("username") as string,
    form.get("password") as string,
  )

  if (result.data) {
    // @ts-expect-error
    cookies().set("vinyl_token", result.data.token)
    redirect(`/`)
  }

  return result
}

export default async function SignUp() {
  const user = await vinylApi(cookies().get("vinyl_token")?.value).getUser()
  if (user.data) redirect("/")

  return (
    <AuthForm
      title="Sign Up"
      buttonText="Sign Up"
      buttonTextPending="Signing Up..."
      submit={signUp}
      footer={
        <p className="text-center">
          Already have an account?{" "}
          <Link href="/sign-in" className="link underline">
            Sign In
          </Link>
        </p>
      }
    />
  )
}
