'use client'

import { useState, useMemo } from 'react'
import Header from '@/components/Header'
import Gallery from '@/components/Gallery'
import Footer from '@/components/Footer'

function shuffleArray(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function HomeClient({ photos }) {
  const [filters, setFilters] = useState({ band: '', venue: '', year: '' })
  const [sortOrder, setSortOrder] = useState('newest')
  const [shuffleSeed, setShuffleSeed] = useState(null)

  const handleSortChange = (order) => {
    if (order === 'shuffle') {
      setShuffleSeed(Math.random())
    }
    setSortOrder(order)
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const bands = useMemo(() => [...new Set(photos.map(p => p.band).filter(Boolean))].sort(), [photos])
  const venues = useMemo(() => [...new Set(photos.map(p => p.venue).filter(Boolean))].sort(), [photos])
  const years = useMemo(() => [...new Set(photos.map(p => p.date?.slice(0, 4)).filter(Boolean))].sort(), [photos])

  const orderedPhotos = useMemo(() => {
    const base = photos.filter(photo => {
      const matchesBand = !filters.band || photo.band === filters.band
      const matchesVenue = !filters.venue || photo.venue === filters.venue
      const matchesYear = !filters.year || photo.date?.slice(0, 4) === filters.year
      return matchesBand && matchesVenue && matchesYear
    })
    if (sortOrder === 'newest') {
      return [...base].sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    }
    if (sortOrder === 'oldest') {
      return [...base].sort((a, b) => (a.date || '').localeCompare(b.date || ''))
    }
    if (sortOrder === 'shuffle') {
      return shuffleArray(base)
    }
    return base
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photos, filters, sortOrder, shuffleSeed])

  return (
    <>
      <Header
        filters={filters}
        onFilterChange={handleFilterChange}
        bands={bands}
        venues={venues}
        years={years}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
      />
      <Gallery photos={orderedPhotos} />
      <Footer />
    </>
  )
}
