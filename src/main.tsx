import { StrictMode, Suspense } from "react"
import { createRoot } from "react-dom/client"
import { App } from "./app"

createRoot(document.querySelector("#root") as HTMLElement).render(
  <StrictMode>
    <Suspense fallback={<p>Loading...</p>}>
      <App />
    </Suspense>
  </StrictMode>,
)
