import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'

import {deskStructure} from './sanity/deskStructure'
import {schemaTypes} from './sanity/schemaTypes'

const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
  process.env.SANITY_PROJECT_ID ||
  import.meta.env?.NEXT_PUBLIC_SANITY_PROJECT_ID ||
  import.meta.env?.SANITY_STUDIO_PROJECT_ID ||
  'r4cx0dqy'

const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET ||
  process.env.SANITY_DATASET ||
  import.meta.env?.NEXT_PUBLIC_SANITY_DATASET ||
  import.meta.env?.SANITY_STUDIO_DATASET ||
  'production'

export default defineConfig({
  name: 'default',
  title: 'Photo Portfolio Studio',
  projectId,
  dataset,
  basePath: '/studio',
  plugins: [structureTool({structure: deskStructure}), visionTool()],
  schema: {
    types: schemaTypes,
  },
})
