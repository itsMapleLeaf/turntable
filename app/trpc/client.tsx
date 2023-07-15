import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createTRPCReact, httpBatchLink } from "@trpc/react-query"
import { useState, type ReactNode } from "react"
import { type AppRouter } from "./router.server"

export const trpc = createTRPCReact<AppRouter>({
  overrides: {
    useMutation: {
      onSuccess(options) {
        return options.queryClient.invalidateQueries()
      },
    },
  },
})

export function TrpcProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [httpBatchLink({ url: "/trpc" })],
    }),
  )

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  )
}
