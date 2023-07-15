import {
  defer,
  json,
  redirect,
  type ActionArgs,
  type LinksFunction,
  type LoaderArgs,
  type V2_MetaFunction,
} from "@remix-run/node"
import {
  Await,
  Links,
  LiveReload,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  useActionData,
  useLoaderData,
  useSearchParams,
} from "@remix-run/react"
import { LogIn, UserPlus } from "lucide-react"
import { Suspense } from "react"
import { z } from "zod"
import { zfd } from "zod-form-data"
import { Label } from "~/components/label"
import background from "./assets/background.jpg"
import favicon from "./assets/favicon.png"
import { Button } from "./components/button"
import { FormLayout } from "./components/form-layout"
import { Header } from "./components/header"
import { Spinner } from "./components/spinner"
import { VinylApiError, vinylApi } from "./data/vinyl-api.server"
import { createSession } from "./data/vinyl-session.server"
import { raise, toError } from "./helpers/errors"
import { usePendingSubmit } from "./helpers/use-pending-submit"
import style from "./style.css"

export const meta: V2_MetaFunction = () => [{ title: "Turntable" }]

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: style },
  { rel: "icon", href: favicon },
]

export function loader({ request }: LoaderArgs) {
  const api = vinylApi(request)
  return defer({
    user: api.getUser().catch((error) => {
      const isUnauthorized =
        error instanceof VinylApiError && error.status === 401
      if (!isUnauthorized) {
        console.error("Failed to get user:", error)
      }
      return null
    }),
  })
}

export async function action({ request }: ActionArgs) {
  const schema = z.union([
    zfd.formData({
      action: zfd.text(z.literal("login")),
      username: zfd.text(),
      password: zfd.text(),
    }),
    zfd.formData({
      action: zfd.text(z.literal("register")),
      username: zfd.text(),
      password: zfd.text(),
      passwordRepeat: zfd.text(),
    }),
  ])

  try {
    const form = await schema
      .parseAsync(await request.formData())
      .catch(() => raise("Invalid form data"))

    if (form.action === "login") {
      const api = vinylApi(request)
      const result = await api.login(form)
      return redirect(request.headers.get("referer") ?? "/", {
        headers: { "Set-Cookie": await createSession(result.token) },
      })
    }

    if (form.action === "register") {
      if (form.password !== form.passwordRepeat) {
        return json({ error: "Passwords do not match" }, 400)
      }

      const api = vinylApi(request)
      const result = await api.register(form)
      return redirect(request.headers.get("referer") ?? "/", {
        headers: { "Set-Cookie": await createSession(result.token) },
      })
    }

    throw new Error("Invalid action")
  } catch (error) {
    if (error instanceof VinylApiError) {
      return json({ error: error.message }, error.status)
    }
    return json({ error: toError(error).message }, 500)
  }
}

export default function Root() {
  const { user } = useLoaderData<typeof loader>()
  return (
    <html
      lang="en"
      className="overflow-x-clip break-words bg-black text-gray-100 [word-break:break-word] selection:bg-accent-600/50"
    >
      <head>
        <Links />
        <Meta />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Turntable</title>

        <link rel="preconnect" href="https://fonts.googleapis.com"></link>
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        ></link>
        <link
          href="https://fonts.googleapis.com/css2?family=Pathway+Extreme:wght@300;400;500&display=swap"
          rel="stylesheet"
        ></link>
      </head>
      <body
        className="bg-cover bg-fixed bg-center"
        style={{ backgroundImage: `url(${background})` }}
      >
        <div className="relative isolate flex min-h-screen flex-col bg-black/50">
          <Header user={user} />
          <Suspense fallback="Loading...">
            <Await resolve={user}>
              {(user) => (user ? <Outlet /> : <AuthForms />)}
            </Await>
          </Suspense>
        </div>
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}

function AuthForms() {
  const [searchParams] = useSearchParams()
  const view = searchParams.get("auth-view") ?? "login"
  return view === "login" ? <SignInForm /> : <RegisterForm />
}

function SignInForm() {
  const pending = usePendingSubmit()
  const { error } = useActionData<typeof action>() ?? {}

  return (
    <FormLayout title="Sign In" error={error}>
      <Label text="Username">
        <input
          name="username"
          type="text"
          placeholder="awesomeuser"
          className="input"
          required
        />
      </Label>
      <Label text="Password">
        <input
          name="password"
          type="password"
          placeholder="•••••••"
          className="input"
          required
        />
      </Label>
      <Button
        pending={pending}
        label="Sign in"
        pendingLabel="Signing in..."
        iconElement={<LogIn />}
        element={<button type="submit" name="action" value="login" />}
      />
      <p>
        Don't have an account?{" "}
        <NavLink
          to="?auth-view=register"
          replace
          className="link inline-flex items-center gap-2 underline"
        >
          {(state) => <>Create one {state.isPending && <Spinner size={4} />}</>}
        </NavLink>
      </p>
    </FormLayout>
  )
}

function RegisterForm() {
  const pending = usePendingSubmit()
  const { error } = useActionData<typeof action>() ?? {}

  return (
    <FormLayout title="Register" error={error}>
      <Label text="Username">
        <input
          name="username"
          type="text"
          placeholder="awesomeuser"
          className="input"
          required
        />
      </Label>
      <Label text="Password">
        <input
          name="password"
          type="password"
          placeholder="•••••••"
          className="input"
          required
        />
      </Label>
      <Label text="Confirm Password">
        <input
          name="passwordRepeat"
          type="password"
          placeholder="•••••••"
          className="input"
          required
        />
      </Label>
      <Button
        pending={pending}
        label="Register"
        pendingLabel="Registering..."
        iconElement={<UserPlus />}
        element={<button type="submit" name="action" value="register" />}
      />
      <p>
        Already have an account?{" "}
        <NavLink
          to="?auth-view=login"
          replace
          className="link inline-flex items-center gap-2 underline"
        >
          {(state) => <>Sign in {state.isPending && <Spinner size={4} />}</>}
        </NavLink>
      </p>
    </FormLayout>
  )
}
