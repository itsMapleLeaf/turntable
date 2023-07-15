import { type ReactNode } from "react"
import { AuthForms } from "~/components/auth-forms"
import { trpc } from "~/trpc/client"
import { QueryResult } from "./query-result"

export function AuthGuard({ children }: { children: ReactNode }) {
  const userQuery = trpc.auth.user.useQuery()
  return (
    <QueryResult
      query={userQuery}
      loadingText="Logging in..."
      errorPrefix="Failed to log in"
      render={(user) => (user ? children : <AuthForms />)}
    />
  )
}
