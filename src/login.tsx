import { vinylApi } from "./data/vinyl-api.server"
import { createSession } from "./data/vinyl-session"

const api = vinylApi()

export function Login() {
  const handleSubmit = async (
    event: SubmitEvent & { currentTarget: HTMLFormElement },
  ) => {
    event.preventDefault()

    const form = new FormData(event.currentTarget)

    const fn =
      (event.submitter as HTMLButtonElement | null)?.value === "login"
        ? // eslint-disable-next-line @typescript-eslint/unbound-method
          api.login
        : // eslint-disable-next-line @typescript-eslint/unbound-method
          api.register

    const response = await fn({
      username: form.get("username") as string,
      password: form.get("password") as string,
    })

    if (!response.data) {
      console.error(response.error)
      return
    }

    createSession(response.data.token)
    window.location.reload()
  }

  return (
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    <form onSubmit={handleSubmit}>
      <label>
        Username:
        <input type="text" name="username" />
      </label>
      <label>
        Password:
        <input type="password" name="password" />
      </label>
      <button type="submit" name="_action" value="login">
        Login
      </button>
      <button type="submit" name="_action" value="register">
        Register
      </button>
    </form>
  )
}
