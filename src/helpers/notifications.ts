let notification: Notification | undefined

export async function showNotification({
  title,
  ...options
}: {
  title: string
  body: string
}) {
  try {
    const permission = await Notification.requestPermission()
    if (permission !== "granted") return

    notification?.close()

    notification = new Notification(title, { ...options, silent: true })
    notification.addEventListener("click", () => {
      window.focus()
      notification?.close()
      notification = undefined
    })
  } catch (error) {
    console.warn("Failed to show notification:", error)
  }
}
