import { useAuthContext } from "./auth-context"
import { AuthForms } from "./auth-forms"

export function App() {
  const auth = useAuthContext()
  return auth.user
    ? (
      <main>
        <h1>welcome to turntable, {auth.user.display_name}!</h1>
        <button type="button" onClick={auth.logout}>
          sign out
        </button>
      </main>
    )
    : <AuthForms />
}
