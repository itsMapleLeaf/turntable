/* eslint-disable @typescript-eslint/consistent-type-definitions */
type Json = string | number | boolean | null | Json[] | { [key: string]: Json }

interface JSON {
  parse(
    text: string,
    reviver?: ((key: string, value: unknown) => unknown) | null | undefined,
  ): Json
}

interface Response {
  json(): Promise<Json>
}
