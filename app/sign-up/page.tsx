import { UserPlus } from "lucide-react"
import Link from "next/link"

export default function SignUp() {
  return (
    <form className="panel container max-w-sm flex flex-col p-4 gap-4 border mt-4 items-center">
      <h1 className="text-3xl font-light">Sign Up</h1>
      <label className="w-full">
        <div className="text-sm font-medium leading-none mb-1">Username</div>
        <input type="text" placeholder="awesomeuser" className="input" />
      </label>
      <label className="w-full">
        <div className="text-sm font-medium leading-none mb-1">Password</div>
        <input type="password" placeholder="•••••••" className="input" />
      </label>
      <button className="button">
        <UserPlus className="w-5 h-5" aria-hidden /> Sign Up
      </button>
      <p>
        Already have an account?{" "}
        <Link href="/sign-in" className="link underline">
          Sign In
        </Link>
      </p>
    </form>
  )
}
