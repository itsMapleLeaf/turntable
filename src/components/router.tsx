import { createRouter } from "./create-router"

export const { Router, Route, Link } = createRouter<
  | "/"
  | "/rooms/:roomId"
  | "/rooms/:roomId/history"
>()
