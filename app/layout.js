import { Outfit } from 'next/font/google'
import { Analytics } from "@vercel/analytics/next"
import './globals.css'

const outfit = Outfit({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700']
})

export const metadata = {
  title: 'blindeye.photo - Photo Portfolio',
  description: 'Live music photography',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={outfit.className}>
          {children}
          <Analytics />
        </body>
    </html>
  )
}
