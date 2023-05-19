export function createSession(token: string) {
  localStorage.setItem("token", token)
}

export function destroySession() {
  localStorage.removeItem("token")
}

export function getSessionToken() {
  return localStorage.getItem("token")
}
