type Json = string | number | boolean | null | Json[] | { [key: string]: Json }

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
interface JSON {
  parse(
    text: string,
    reviver?: ((key: string, value: unknown) => unknown) | null | undefined,
  ): Json
}
