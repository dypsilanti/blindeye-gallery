import {createClient} from '@sanity/client'
import nextEnv from '@next/env'

const {loadEnvConfig} = nextEnv
loadEnvConfig(process.cwd())

const editableFields = new Set(['band', 'venue', 'city', 'date'])

function parseArgs() {
  const args = process.argv.slice(2)
  const where = {}
  const whereContains = {}
  const set = {}
  let dryRun = false
  let applyToAll = false

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]

    if (arg === '--dry-run') {
      dryRun = true
      continue
    }

    if (arg === '--all') {
      applyToAll = true
      continue
    }

    if (arg === '--where') {
      const pair = args[index + 1]
      if (!pair || !pair.includes('=')) {
        throw new Error('Expected --where field=value')
      }

      const [field, ...rest] = pair.split('=')
      const value = rest.join('=').trim()

      if (!editableFields.has(field)) {
        throw new Error(`Unsupported --where field: ${field}`)
      }

      if (!value) {
        throw new Error(`Empty value for --where ${field}`)
      }

      where[field] = value
      index += 1
      continue
    }

    if (arg === '--where-contains') {
      const pair = args[index + 1]
      if (!pair || !pair.includes('=')) {
        throw new Error('Expected --where-contains field=value')
      }

      const [field, ...rest] = pair.split('=')
      const value = rest.join('=').trim()

      if (!editableFields.has(field)) {
        throw new Error(`Unsupported --where-contains field: ${field}`)
      }

      whereContains[field] = value
      index += 1
      continue
    }

    if (arg === '--set') {
      const pair = args[index + 1]
      if (!pair || !pair.includes('=')) {
        throw new Error('Expected --set field=value')
      }

      const [field, ...rest] = pair.split('=')
      const value = rest.join('=').trim()

      if (!editableFields.has(field)) {
        throw new Error(`Unsupported --set field: ${field}`)
      }

      if (!value) {
        throw new Error(`Empty value for --set ${field}`)
      }

      set[field] = value
      index += 1
      continue
    }

    throw new Error(`Unknown argument: ${arg}`)
  }

  if (!applyToAll && Object.keys(where).length === 0 && Object.keys(whereContains).length === 0) {
    throw new Error('At least one --where or --where-contains is required')
  }

  if (Object.keys(set).length === 0) {
    throw new Error('At least one --set field=value is required')
  }

  return {where, whereContains, set, dryRun, applyToAll}
}

function createSanityClient() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET || 'production'
  const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || process.env.SANITY_API_VERSION || '2026-03-11'
  const token = process.env.SANITY_API_TOKEN

  if (!projectId) throw new Error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_PROJECT_ID')
  if (!token) throw new Error('Missing SANITY_API_TOKEN')

  return createClient({
    projectId,
    dataset,
    apiVersion,
    token,
    useCdn: false,
  })
}

function matchesWhere(photo, where, whereContains) {
  const exactMatch = Object.entries(where).every(([field, value]) => String(photo[field] || '') === value)
  const containsMatch = Object.entries(whereContains).every(([field, value]) =>
    String(photo[field] || '').toLowerCase().includes(value.toLowerCase()),
  )

  return exactMatch && containsMatch
}

async function main() {
  const {where, whereContains, set, dryRun, applyToAll} = parseArgs()
  const client = createSanityClient()

  const photos = await client.fetch(`*[_type == "photo"]{_id, band, venue, city, date}`)
  const matches = applyToAll ? photos : photos.filter((photo) => matchesWhere(photo, where, whereContains))

  if (matches.length === 0) {
    console.log('No matching photos found.')
    return
  }

  console.log(`Matched ${matches.length} photo(s).`)
  console.log(`All: ${applyToAll}`)
  console.log(`Filter: ${JSON.stringify(where)}`)
  console.log(`Contains Filter: ${JSON.stringify(whereContains)}`)
  console.log(`Update: ${JSON.stringify(set)}`)

  if (dryRun) {
    console.log('Dry run enabled. No changes written.')
    for (const photo of matches.slice(0, 20)) {
      console.log(`- ${photo._id} | ${photo.band || ''} | ${photo.venue || ''} | ${photo.city || ''} | ${photo.date || ''}`)
    }
    return
  }

  const transaction = client.transaction()
  for (const photo of matches) {
    transaction.patch(photo._id, {set})
  }

  await transaction.commit()
  console.log(`Updated ${matches.length} photo(s).`)
}

main().catch((error) => {
  console.error(error.message)
  console.error('Usage: npm run bulk:update:photos -- --all --set date=2026-02-21 OR --where band=adhesive --where-contains band=adhesive --set venue=Curleys [--set city=Buffalo] [--dry-run]')
  process.exit(1)
})
