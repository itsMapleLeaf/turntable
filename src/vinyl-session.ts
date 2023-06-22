const sessionKey = "vinyl-token"

export function createSession(token: string) {
  localStorage.setItem(sessionKey, token)
}

export function destroySession() {
  localStorage.removeItem(sessionKey)
}

export function getSessionToken() {
  return localStorage.getItem(sessionKey)
}
