import { useAuthContext } from "./auth-context"
import { AuthForms } from "./auth-forms"
import { Header } from "./header"

export function App() {
  const auth = useAuthContext()
  return <>
    <Header />
    {auth.user ? <main>hi</main> : <AuthForms />}
  </>
}
