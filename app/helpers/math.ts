export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

/** like JS modulo, but loops on negatives */
export function mod(n: number, m: number) {
  return ((n % m) + m) % m
}
