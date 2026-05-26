import type { Metadata } from "next"
import { Barlow, Barlow_Condensed, Bebas_Neue } from "next/font/google"
import "./globals.css"

const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
})

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
})

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas-neue",
  subsets: ["latin"],
  weight: ["400"],
})

export const metadata: Metadata = {
  title: "Extremo Sur BJJ 2026",
  description: "Circuito 2026 de Brazilian Jiu Jitsu en Maldonado, Uruguay. Inscribite ahora.",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${barlow.variable} ${barlowCondensed.variable} ${bebasNeue.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#050810] text-[#f0f4ff]" style={{ fontFamily: "var(--font-barlow), sans-serif" }}>
        {children}
      </body>
    </html>
  )
}
