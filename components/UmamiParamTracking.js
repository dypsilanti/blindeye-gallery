'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

export default function UmamiParamTracking() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const band = searchParams.get('band')
    const venue = searchParams.get('venue')
    const year = searchParams.get('year')

    if (band && typeof window.umami !== 'undefined') {
      window.umami.track('band-page-view', { band, venue, year })
    }
  }, [searchParams])

  return null
}