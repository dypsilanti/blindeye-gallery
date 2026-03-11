import {metadata} from 'next-sanity/studio'

import Studio from '../Studio'

export {metadata}

export const dynamic = 'force-dynamic'

export default function StudioPage() {
  return <Studio />
}
