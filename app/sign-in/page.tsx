import { LogIn } from "lucide-react"
import Link from "next/link"

export default function SignIn() {
  return (
    <form className="panel container max-w-sm flex flex-col p-4 gap-4 border mt-4 items-center">
      <h1 className="text-3xl font-light">Sign In</h1>
      <label className="w-full">
        <div className="text-sm font-medium leading-none mb-1">Username</div>
        <input type="text" placeholder="awesomeuser" className="input" />
      </label>
      <label className="w-full">
        <div className="text-sm font-medium leading-none mb-1">Password</div>
        <input type="password" placeholder="•••••••" className="input" />
      </label>
      <button className="button">
        <LogIn aria-hidden /> Sign In
      </button>
      <p>
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="link underline">
          Sign Up
        </Link>
      </p>
    </form>
  )
}
