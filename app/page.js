'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import Gallery from '@/components/Gallery'
import Footer from '@/components/Footer'
import { photos } from '@/data/photos'

export default function Home() {
  const [filters, setFilters] = useState({
    band: '',
    venue: '',
    year: ''
  })

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const filteredPhotos = photos.filter(photo => {
    const matchesBand = !filters.band || photo.band === filters.band
    const matchesVenue = !filters.venue || photo.venue === filters.venue
    const matchesYear = !filters.year || photo.year === filters.year
    return matchesBand && matchesVenue && matchesYear
  })

  return (
    <>
      <Header 
        filters={filters}
        onFilterChange={handleFilterChange}
      />
      <Gallery photos={filteredPhotos} />
      <Footer />
    </>
  )
}
