import { Outfit } from 'next/font/google'
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import './globals.css'
import Script from 'next/script'
import UmamiParamTracking from '@/components/UmamiParamTracking'

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
          <SpeedInsights />
          <Script 
            defer src="https://cloud.umami.is/script.js" 
            data-website-id="8efd9021-e95d-4abe-a045-fb406ba3e040"
            strategy="afterInteractive"
          />
          <UmamiParamTracking />
        </body>
    </html>
  )
}
