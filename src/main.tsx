import { StrictMode, Suspense } from "react"
import { createRoot } from "react-dom/client"
import { ErrorBoundary } from "react-error-boundary"
import { App } from "./components/app"
import { AuthProvider } from "./components/auth-context"
import { Spinner } from "./components/spinner"

createRoot(document.querySelector("#root") as HTMLElement).render(
  <StrictMode>
    <ErrorBoundary fallback={<p>shit hit the fan lol</p>}>
      <AuthProvider>
        <Suspense fallback={<Spinner />}>
          <App />
        </Suspense>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
)
