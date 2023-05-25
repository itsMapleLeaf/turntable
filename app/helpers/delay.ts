export const delay = (ms: number, options: { signal?: AbortSignal } = {}) =>
  new Promise<void>((resolve, reject) => {
    setTimeout(resolve, ms)
    options?.signal?.addEventListener(
      "abort",
      () => reject(new Error("Aborted")),
      { once: true },
    )
  })
