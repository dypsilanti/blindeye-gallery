import {createReadStream} from 'node:fs'
import {readdir, readFile, stat} from 'node:fs/promises'
import path from 'node:path'
import {createClient} from '@sanity/client'
import nextEnv from '@next/env'

const {loadEnvConfig} = nextEnv

loadEnvConfig(process.cwd())

const allowedExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif'])

function parseArgs() {
  const [, , imagesDir, metadataPath] = process.argv

  if (!imagesDir) {
    console.error('Usage: npm run import:photos -- <imagesDir> [metadata.json]')
    process.exit(1)
  }

  return {imagesDir, metadataPath}
}

async function collectImageFiles(dir) {
  const entries = await readdir(dir, {withFileTypes: true})
  const files = []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      const nested = await collectImageFiles(fullPath)
      files.push(...nested)
      continue
    }

    const extension = path.extname(entry.name).toLowerCase()
    if (allowedExtensions.has(extension)) {
      files.push(fullPath)
    }
  }

  return files
}

function parseFromFilename(filePath) {
  const base = path.basename(filePath, path.extname(filePath))
  const [band, venue, city, date] = base.split('--').map((part) => part?.trim())

  return {
    band: band || undefined,
    venue: venue || undefined,
    city: city || undefined,
    date: date || undefined,
  }
}

async function loadMetadata(metadataPath) {
  if (!metadataPath) return {}

  const content = await readFile(metadataPath, 'utf8')
  const parsed = JSON.parse(content)
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Metadata file must be a JSON object keyed by filename')
  }

  return parsed
}

function createSanityClient() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
  const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-03-11'
  const token = process.env.SANITY_API_TOKEN

  if (!projectId) throw new Error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID')
  if (!dataset) throw new Error('Missing NEXT_PUBLIC_SANITY_DATASET')
  if (!token) throw new Error('Missing SANITY_API_TOKEN')

  return createClient({
    projectId,
    dataset,
    apiVersion,
    token,
    useCdn: false,
  })
}

async function main() {
  const {imagesDir, metadataPath} = parseArgs()
  const metadata = await loadMetadata(metadataPath)
  const client = createSanityClient()

  const directoryStats = await stat(imagesDir)
  if (!directoryStats.isDirectory()) {
    throw new Error(`Not a directory: ${imagesDir}`)
  }

  const imageFiles = await collectImageFiles(imagesDir)
  if (imageFiles.length === 0) {
    console.log('No images found to import.')
    return
  }

  let importedCount = 0

  for (const filePath of imageFiles) {
    const filename = path.basename(filePath)
    const filenameData = parseFromFilename(filePath)
    const metadataData = metadata[filename] || metadata[path.parse(filename).name] || {}

    const band = metadataData.band ?? filenameData.band
    const venue = metadataData.venue ?? filenameData.venue
    const city = metadataData.city ?? filenameData.city
    const date = metadataData.date ?? filenameData.date

    const asset = await client.assets.upload('image', createReadStream(filePath), {
      filename,
    })

    await client.create({
      _type: 'photo',
      band,
      venue,
      city,
      date,
      image: {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: asset._id,
        },
      },
    })

    importedCount += 1
    console.log(`Imported ${importedCount}/${imageFiles.length}: ${filename}`)
  }

  console.log(`Done. Imported ${importedCount} photo documents.`)
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
