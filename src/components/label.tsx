export function Label({
  text,
  children,
}: {
  text: string
  children: React.ReactNode
}) {
  return (
    <label className="w-full">
      <div className="mb-1 text-sm font-medium leading-none">{text}</div>
      {children}
    </label>
  )
}
