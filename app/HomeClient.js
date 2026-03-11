'use client'

import { useState, useMemo } from 'react'
import Header from '@/components/Header'
import Gallery from '@/components/Gallery'
import Footer from '@/components/Footer'

export default function HomeClient({ photos }) {
  const [filters, setFilters] = useState({ band: '', venue: '', year: '' })

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const bands = useMemo(() => [...new Set(photos.map(p => p.band).filter(Boolean))].sort(), [photos])
  const venues = useMemo(() => [...new Set(photos.map(p => p.venue).filter(Boolean))].sort(), [photos])
  const years = useMemo(() => [...new Set(photos.map(p => p.date?.slice(0, 4)).filter(Boolean))].sort(), [photos])

  const filteredPhotos = photos.filter(photo => {
    const matchesBand = !filters.band || photo.band === filters.band
    const matchesVenue = !filters.venue || photo.venue === filters.venue
    const matchesYear = !filters.year || photo.date?.slice(0, 4) === filters.year
    return matchesBand && matchesVenue && matchesYear
  })

  return (
    <>
      <Header
        filters={filters}
        onFilterChange={handleFilterChange}
        bands={bands}
        venues={venues}
        years={years}
      />
      <Gallery photos={filteredPhotos} />
      <Footer />
    </>
  )
}
