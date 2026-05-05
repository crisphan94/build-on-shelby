import { CatalogView } from '@/components/dataset/CatalogView'
import { Suspense } from 'react'

export default function Home() {
  return (
    <Suspense>
      <CatalogView />
    </Suspense>
  )
}
