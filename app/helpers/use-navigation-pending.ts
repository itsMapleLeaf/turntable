import { useNavigation } from "@remix-run/react"

export function useNavigationPending() {
  const navigation = useNavigation()
  return (
    navigation.state === "submitting" ||
    (navigation.state === "loading" &&
      navigation.formData != null &&
      navigation.formAction !== navigation.location.pathname)
  )
}
