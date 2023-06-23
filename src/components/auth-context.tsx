import { createContext, useContext, useState } from "react"
import { vinylApi } from "~/data/vinyl-api"
import { createSession, destroySession } from "~/data/vinyl-session"
import { type User } from "~/data/vinyl-types"
import { raise } from "~/helpers/errors"
import { suspend } from "../helpers/suspense"

function useAuthProvider() {
  const [userPromise, setUserPromise] = useState(() => vinylApi.getUser().catch(() => undefined))

  function login(token: string, user: User) {
    createSession(token)
    setUserPromise(Promise.resolve(user))
  }

  function logout() {
    destroySession()
    setUserPromise(Promise.resolve(undefined))
  }

  return { userPromise, login, logout }
}

const AuthContext = createContext<ReturnType<typeof useAuthProvider> | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuthProvider()
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const { userPromise, ...auth } = useContext(AuthContext)
    ?? raise("useAuthContext must be used within an AuthProvider")

  const user = suspend(userPromise)

  return { user, ...auth }
}
