import { Suspense } from "solid-js"
import { render } from "solid-js/web"
import { App } from "./app"

render(
  () => (
    <Suspense fallback={<p>Loading...</p>}>
      <App />
    </Suspense>
  ),
  document.querySelector("#root") as Element,
)
