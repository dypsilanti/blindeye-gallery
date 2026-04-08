'use client'

import { useState, useMemo } from 'react'
import Header from '@/components/Header'
import Gallery from '@/components/Gallery'
import Footer from '@/components/Footer'

function getSeededRank(value, seed) {
  let hash = (2166136261 ^ seed) >>> 0

  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }

  return hash >>> 0
}

function shuffleArray(arr, seed) {
  return [...arr].sort((a, b) => {
    const idA = String(a._id || a.imageUrl || '')
    const idB = String(b._id || b.imageUrl || '')

    return getSeededRank(idA, seed) - getSeededRank(idB, seed)
  })
}

export default function HomeClient({ photos, initialShuffleSeed }) {
  const [filters, setFilters] = useState({ band: '', venue: '', year: '' })
  const [sortOrder, setSortOrder] = useState('shuffle')
  const [shuffleSeed, setShuffleSeed] = useState(initialShuffleSeed)

  const handleSortChange = (order) => {
    if (order === 'shuffle') {
      setShuffleSeed(Math.floor(Math.random() * 4294967295))
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
      return shuffleArray(base, shuffleSeed)
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
