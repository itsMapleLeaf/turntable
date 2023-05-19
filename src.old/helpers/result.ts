export type Result<T> =
  | [data: T, error: undefined]
  | [data: undefined, error: unknown]

export function resultify<T>(callback: () => T): Result<T> {
  try {
    return [callback(), undefined]
  } catch (error) {
    return [undefined, error]
  }
}

resultify.promise = async function resultifyPromise<T>(
  promise: PromiseLike<T>,
): Promise<Result<Awaited<T>>> {
  try {
    // eslint-disable-next-line @typescript-eslint/await-thenable
    return [await promise, undefined]
  } catch (error) {
    return [undefined, error]
  }
}
