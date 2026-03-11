import {createClient} from 'next-sanity'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET || 'production'
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || process.env.SANITY_API_VERSION || '2026-03-11'

if (!projectId) {
  throw new Error('Missing Sanity projectId. Set NEXT_PUBLIC_SANITY_PROJECT_ID (or SANITY_PROJECT_ID) in environment variables.')
}

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
})
