import { StrictMode, Suspense } from "react"
import { createRoot } from "react-dom/client"
import { ErrorBoundary } from "react-error-boundary"
import { App } from "./app"

createRoot(document.querySelector("#root") as HTMLElement).render(
  <StrictMode>
    <ErrorBoundary fallback={<p>shit hit the fan lol</p>}>
      <Suspense fallback={<p>Loading...</p>}>
        <App />
      </Suspense>
    </ErrorBoundary>
  </StrictMode>,
)
