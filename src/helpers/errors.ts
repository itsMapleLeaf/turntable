export function raise(error: unknown): never {
  throw typeof error === "string" ? new Error(error) : error
}

export function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error))
}
