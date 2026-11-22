import type { Metadata, Viewport } from "next"
import { Onest } from "next/font/google"

import "./globals.css"
import { SITE_NAME, SITE_SEO_DESCRIPTION, SITE_TITLE, SITE_URL } from "@/lib/site"

const onest = Onest({ subsets: ["latin"], variable: "--font-onest", display: "swap" })

// A page's own metadata fills in the rest (lib/seo.ts). This is what every
// page shares.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_SEO_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: { siteName: SITE_NAME, type: "website", locale: "en_US" },
  twitter: { card: "summary_large_image" },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f8f6" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0c0f" },
  ],
}

// Before the first paint: the saved theme, else the system's. A demo can
// also be told its theme and mode in its address (?dark, ?light, ?still,
// ?embed), and follows the page around it when the theme is switched there.
const BOOT = `(function(){try{var d=document.documentElement,q=new URLSearchParams(location.search),t=localStorage.getItem("theme");var dark=q.has("dark")?true:q.has("light")?false:t?t==="dark":matchMedia("(prefers-color-scheme: dark)").matches;d.classList.toggle("dark",dark);if(q.has("still"))d.classList.add("still");if(q.has("embed"))d.classList.add("embed");addEventListener("storage",function(e){if(e.key==="theme"&&e.newValue)d.classList.toggle("dark",e.newValue==="dark")})}catch(e){}})()`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={onest.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT }} />
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link rel="preconnect" href="https://cdn.fontshare.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=general-sans@500,600&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
