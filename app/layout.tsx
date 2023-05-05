import { Pathway_Extreme } from "next/font/google"
import background from "./assets/background.webp"
import { Header } from "./header"
import "./style.css"

const font = Pathway_Extreme({ subsets: ["latin"] })

export const metadata = {
  title: "Vinyl",
  description:
    "listen to the hottest bangers and freshest memes with your friends",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className="text-gray-100 bg-blend-darken"
      style={{
        background: `rgba(0, 0, 0, 0.50) url(${background.src}) center`,
      }}
    >
      <body className={font.className}>
        <div className="min-h-screen flex flex-col relative isolate">
          <Header />
          {children}
        </div>
      </body>
    </html>
  )
}
