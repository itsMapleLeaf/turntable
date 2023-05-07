import { Form, useActionData } from "@remix-run/react"
import { ActionArgs, LoaderArgs, json, redirect } from "@vercel/remix"
import { Wand2 } from "lucide-react"
import { usePendingSubmit } from "~/helpers/use-pending-submit"
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
  const pending = usePendingSubmit()
  const { error } = useActionData<typeof action>() ?? {}
  return (
    <main className="container py-4">
      <Form
        method="POST"
        className="panel container max-w-sm flex flex-col p-4 gap-4 border mt-4 items-center"
      >
        <h1 className="text-3xl font-light">Create a room</h1>
        <label className="w-full">
          <div className="text-sm font-medium leading-none mb-1">Room name</div>
          <input
            name="name"
            type="text"
            placeholder="only bangers allowed"
            className="input"
            required
          />
        </label>
        <button className="button" disabled={pending}>
          <Wand2 aria-hidden /> {pending ? "Creating room..." : "Create room"}
        </button>
        {error ? <p className="text-error-400">{error}</p> : null}
      </Form>
    </main>
  )
}
