import { useCallback, useLayoutEffect, useState } from "react"
import { type z } from "zod"

export function useLocalStorageState<T>(
  key: string,
  defaultValue: T,
  schema: z.ZodType<T>,
) {
  const [internalValue, setInternalValue] = useState<T>(defaultValue)

  useLayoutEffect(() => {
    const storedValue = localStorage.getItem(key)
    if (!storedValue) return

    const parsedValue = schema.safeParse(JSON.parse(storedValue))
    if (!parsedValue.success) return

    setInternalValue(parsedValue.data)
  }, [key, defaultValue, schema])

  const setValue = useCallback(
    (newValue: T) => {
      setInternalValue(newValue)
      localStorage.setItem(key, JSON.stringify(newValue))
    },
    [key],
  )

  return [internalValue, setValue] as const
}
