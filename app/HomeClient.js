'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
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

function normalizeVenueSortName(venue) {
  return String(venue || '').replace(/^the\s+/i, '').trim()
}

export default function HomeClient({ photos, initialShuffleSeed }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const [filters, setFilters] = useState(() => ({
    band: searchParams.get('band') || '',
    venue: searchParams.get('venue') || '',
    year: searchParams.get('year') || '',
    city: searchParams.get('city') || '',
    date: searchParams.get('date') || '',
  }))
  const [sortOrder, setSortOrder] = useState('shuffle')
  const [shuffleSeed, setShuffleSeed] = useState(initialShuffleSeed)
  const [headerHidden, setHeaderHidden] = useState(false)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY
      const diff = currentY - lastScrollY.current
      if (diff > 8) {
        setHeaderHidden(true)
      } else if (diff < -8) {
        setHeaderHidden(false)
      }
      lastScrollY.current = currentY
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Keep the URL in sync with active filters so the page is shareable as a link.
  useEffect(() => {
    const params = new URLSearchParams()
    if (filters.band) params.set('band', filters.band)
    if (filters.venue) params.set('venue', filters.venue)
    if (filters.year) params.set('year', filters.year)
    if (filters.city) params.set('city', filters.city)
    if (filters.date) params.set('date', filters.date)
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }, [filters, pathname, router])

  const handleSortChange = (order) => {
    if (order === 'shuffle') {
      setShuffleSeed(Math.floor(Math.random() * 4294967295))
    }
    setSortOrder(order)
  }

  const handleFilterChange = (key, value) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: value }

      // Year dropdown controls broad year filtering, so clear exact-date facet.
      if (key === 'year') {
        next.date = ''
      }

      return next
    })
  }

  const handleMetadataFilter = (keyOrFilters, value) => {
    const resetFilters = { band: '', venue: '', year: '', city: '', date: '' }

    if (typeof keyOrFilters === 'object' && keyOrFilters !== null) {
      setFilters({ ...resetFilters, ...keyOrFilters })
      return
    }

    setFilters({ ...resetFilters, [keyOrFilters]: value })
  }

  const bands = useMemo(() => {
    const sourcePhotos = photos.filter((photo) => {
      const matchesVenue = !filters.venue || photo.venue === filters.venue
      const matchesYear = !filters.year || photo.date?.slice(0, 4) === filters.year
      const matchesCity = !filters.city || photo.city === filters.city
      const matchesDate = !filters.date || photo.date === filters.date
      return matchesVenue && matchesYear && matchesCity && matchesDate
    })

    return [...new Set(sourcePhotos.map((photo) => photo.band).filter(Boolean))].sort()
  }, [photos, filters])

  const venues = useMemo(() => {
    const sourcePhotos = photos.filter((photo) => {
      const matchesBand = !filters.band || photo.band === filters.band
      const matchesYear = !filters.year || photo.date?.slice(0, 4) === filters.year
      const matchesCity = !filters.city || photo.city === filters.city
      const matchesDate = !filters.date || photo.date === filters.date
      return matchesBand && matchesYear && matchesCity && matchesDate
    })

    const venueToCities = new Map()

    for (const photo of sourcePhotos) {
      if (!photo.venue) continue

      if (!venueToCities.has(photo.venue)) {
        venueToCities.set(photo.venue, new Set())
      }

      if (photo.city) {
        venueToCities.get(photo.venue).add(photo.city)
      }
    }

    return [...venueToCities.entries()]
      .sort(([a], [b]) => {
        const normalizedA = normalizeVenueSortName(a)
        const normalizedB = normalizeVenueSortName(b)
        const primary = normalizedA.localeCompare(normalizedB)
        if (primary !== 0) return primary
        return a.localeCompare(b)
      })
      .map(([venue, cities]) => {
        const cityList = [...cities].sort((a, b) => a.localeCompare(b))
        const citySuffix = cityList.length > 0 ? ` - ${cityList[0]}` : ''

        return {
          value: venue,
          label: `${venue}${citySuffix}`,
        }
      })
  }, [photos, filters])

  const years = useMemo(() => {
    const sourcePhotos = photos.filter((photo) => {
      const matchesBand = !filters.band || photo.band === filters.band
      const matchesVenue = !filters.venue || photo.venue === filters.venue
      const matchesCity = !filters.city || photo.city === filters.city
      const matchesDate = !filters.date || photo.date === filters.date
      return matchesBand && matchesVenue && matchesCity && matchesDate
    })

    return [...new Set(sourcePhotos.map((photo) => photo.date?.slice(0, 4)).filter(Boolean))]
      .sort((a, b) => b.localeCompare(a))
  }, [photos, filters])

  const orderedPhotos = useMemo(() => {
    const base = photos.filter(photo => {
      const matchesBand = !filters.band || photo.band === filters.band
      const matchesVenue = !filters.venue || photo.venue === filters.venue
      const matchesYear = !filters.year || photo.date?.slice(0, 4) === filters.year
      const matchesCity = !filters.city || photo.city === filters.city
      const matchesDate = !filters.date || photo.date === filters.date
      return matchesBand && matchesVenue && matchesYear && matchesCity && matchesDate
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
        hidden={headerHidden}
      />
      <Gallery photos={orderedPhotos} onMetadataFilter={handleMetadataFilter} />
      <Footer />
    </>
  )
}
