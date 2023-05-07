import { useActionData } from "@remix-run/react"
import { json, redirect, type ActionArgs, type LoaderArgs } from "@vercel/remix"
import { FormLayout } from "~/components/form-layout"
import { vinylApi } from "~/vinyl-api.server"

export async function loader({ request }: LoaderArgs) {
  const user = await vinylApi(request).getUser()
  if (!user.data) {
    return redirect(`/sign-in?redirect=${request.url}`)
  }

  return json({})
}

export async function action({ request }: ActionArgs) {
  const api = vinylApi(request)
  const body = await request.formData()

  const name = body.get("name")
  if (typeof name !== "string") {
    return json({ error: "Missing room name" }, 400)
  }

  const result = await api.createRoom(name)
  if (!result.data) {
    return json({ error: result.error }, 400)
  }

  return redirect(`/rooms/${result.data.id}`)
}

export default function CreateRoomPage() {
  const { error } = useActionData<typeof action>() ?? {}
  return (
    <FormLayout
      title="Create a room"
      submitText="Create"
      submitTextPending="Creating..."
      error={error}
    >
      <label className="w-full">
        <div className="mb-1 text-sm font-medium leading-none">Room name</div>
        <input
          name="name"
          type="text"
          placeholder="only bangers allowed"
          className="input"
          required
        />
      </label>
    </FormLayout>
  )
}
