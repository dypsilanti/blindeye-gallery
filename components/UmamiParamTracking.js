'use client'

import { useEffect } from 'react'

export default function UmamiParamTracking() {
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const band = searchParams.get('band')
    const venue = searchParams.get('venue')
    const year = searchParams.get('year')

    if (band && typeof window.umami !== 'undefined') {
      window.umami.track('band-page-view', { band, venue, year })
    }
  }, [])

  return null
}