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
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET || 'production'
  const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || process.env.SANITY_API_VERSION || '2026-03-11'
  const token = process.env.SANITY_API_TOKEN

  if (!projectId) throw new Error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_PROJECT_ID')
  if (!dataset) throw new Error('Missing NEXT_PUBLIC_SANITY_DATASET or SANITY_DATASET')
  if (!token) throw new Error('Missing SANITY_API_TOKEN')

  return createClient({
    projectId,
    dataset,
    apiVersion,
    token,
    useCdn: false,
  })
}

function resolveMetadataForFile({metadata, filePath, metadataDir}) {
  const filename = path.basename(filePath)
  const basename = path.parse(filename).name
  const fileDir = path.dirname(path.resolve(filePath))
  const wildcardMetadata = metadataDir && fileDir === metadataDir ? metadata['*'] || {} : {}
  const specificMetadata = metadata[filename] || metadata[basename] || {}

  return {
    ...wildcardMetadata,
    ...specificMetadata,
  }
}

async function fetchImportedFilenames(client) {
  // Retrieve every photo document and follow the image asset reference so we
  // can read the originalFilename that Sanity stores when an asset is uploaded.
  const docs = await client.fetch(
    `*[_type == "photo" && defined(image.asset)]{
       "originalFilename": image.asset->originalFilename
     }`,
  )

  return new Set(docs.map((doc) => doc.originalFilename).filter(Boolean))
}

async function main() {
  const {imagesDir, metadataPath} = parseArgs()
  const metadata = await loadMetadata(metadataPath)
  const metadataDir = metadataPath ? path.dirname(path.resolve(metadataPath)) : null
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

  console.log('Checking for already-imported photos…')
  const importedFilenames = await fetchImportedFilenames(client)
  console.log(`Found ${importedFilenames.size} previously imported photo(s).`)

  let importedCount = 0
  let skippedCount = 0

  for (const filePath of imageFiles) {
    const filename = path.basename(filePath)

    if (importedFilenames.has(filename)) {
      skippedCount += 1
      console.log(`Skipped (duplicate): ${filename}`)
      continue
    }

    const filenameData = parseFromFilename(filePath)
    const metadataData = resolveMetadataForFile({metadata, filePath, metadataDir})

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
    console.log(`Imported ${importedCount}/${imageFiles.length - skippedCount}: ${filename}`)
  }

  console.log(`Done. Imported ${importedCount} new photo(s), skipped ${skippedCount} duplicate(s).`)
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
