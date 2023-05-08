import { useActionData } from "@remix-run/react"
import { json, redirect, type ActionArgs, type LoaderArgs } from "@vercel/remix"
import { zfd } from "zod-form-data"
import { FormLayout } from "~/components/form-layout"
import { Label } from "~/components/label"
import { vinylApi } from "~/vinyl/vinyl-api.server"

export async function loader({ request }: LoaderArgs) {
  const user = await vinylApi(request).getUser()
  if (!user.data) {
    return redirect(`/sign-in?redirect=${request.url}`)
  }

  return json({})
}

export async function action({ request }: ActionArgs) {
  const form = zfd
    .formData({ name: zfd.text() })
    .parse(await request.formData())

  const result = await vinylApi(request).createRoom(form.name)
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
      <Label text="Room name">
        <input
          name="name"
          type="text"
          placeholder="only bangers allowed"
          className="input"
          required
        />
      </Label>
    </FormLayout>
  )
}
