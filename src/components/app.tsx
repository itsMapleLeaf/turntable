import { Link, Route } from "~/components/router"
import { useAuthContext } from "./auth-context"
import { AuthForms } from "./auth-forms"
import { Header } from "./header"

export function App() {
  const auth = useAuthContext()
  return <>
    <Header />
    {auth.user
      ? <main>
        <nav>
          <Link href="/">home</Link> | <Link href="/rooms/rcufby33tw4k2m3ak78m">the room</Link>|
          {" "}
          <Link href="/rooms/rcufby33tw4k2m3ak78m/history">the room history</Link>
        </nav>
        <Route path="/">
          <p>home</p>
        </Route>
        <Route path="/rooms/:roomId">
          <p>queue</p>
        </Route>
        <Route path="/rooms/:roomId/history">
          <p>history</p>
        </Route>
      </main>
      : <AuthForms />}
  </>
}
