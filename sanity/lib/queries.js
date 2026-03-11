import {groq} from 'next-sanity'

export const photosQuery = groq`
  *[_type == "photo"] | order(_createdAt asc) {
    _id,
    city,
    date,
    image,
    band,
    venue
  }
`
