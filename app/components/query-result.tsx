import { type TRPCClientErrorLike } from "@trpc/client"
import { type UseTRPCQueryResult } from "@trpc/react-query/shared"
import { type ReactNode } from "react"
import { Spinner } from "~/components/spinner"
import { type AppRouter } from "~/trpc/router.server"

export function QueryResult<
  Data,
  Error extends TRPCClientErrorLike<AppRouter>,
>({
  query,
  loadingText,
  errorPrefix,
  render,
}: {
  query: UseTRPCQueryResult<Data, Error>
  loadingText?: ReactNode
  errorPrefix?: ReactNode
  render: (data: Data) => ReactNode
}) {
  if (query.isLoading) {
    return (
      <p className="flex items-center gap-2">
        <Spinner /> {loadingText ?? "Loading..."}
      </p>
    )
  }
  if (query.isError) {
    return (
      <p>
        {errorPrefix ?? "Failed to load data"}: {query.error.message}
      </p>
    )
  }
  return <>{render(query.data)}</>
}
