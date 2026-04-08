import HomeClient from './HomeClient'
import { client } from '@/sanity/lib/client'
import { urlFor } from '@/sanity/lib/image'
import { photosQuery } from '@/sanity/lib/queries'

export const dynamic = 'force-dynamic'

function formatFriendlyDate(dateString) {
  if (!dateString) return 'an unknown date'

  // Preserve year-only values as-is so "2000" doesn't become "January 1, 2000".
  if (/^\d{4}$/.test(dateString)) return dateString

  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return dateString

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

export default async function Home() {
  const rawPhotos = await client.fetch(photosQuery, {}, {cache: 'no-store'})
  const initialShuffleSeed = Math.floor(Math.random() * 4294967295)

  const photos = rawPhotos.map(photo => ({
    ...photo,
    altText: `Photo of ${photo.band || 'an artist'} at ${photo.venue || 'an unknown venue'} on ${formatFriendlyDate(photo.date)}`,
    imageUrl: photo.image
      ? urlFor(photo.image).width(400).height(500).fit('crop').url()
      : null,
    fullImageUrl: photo.image
      ? urlFor(photo.image).fit('max').url()
      : null,
  }))

  return <HomeClient photos={photos} initialShuffleSeed={initialShuffleSeed} />
}
