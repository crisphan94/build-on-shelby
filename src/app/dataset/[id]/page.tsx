import { DatasetDetail } from '@/components/dataset/DatasetDetail'
import { getDataset } from '@/lib/db/datasets'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const dataset = await getDataset(id)
  if (!dataset) return { title: 'Dataset Not Found — DataShelf' }
  return {
    title: `${dataset.name} — DataShelf`,
    description: dataset.description ?? `AI dataset: ${dataset.name}`,
  }
}

export default async function DatasetPage({ params }: Props) {
  const { id } = await params
  const dataset = await getDataset(id)

  if (!dataset) notFound()

  return <DatasetDetail dataset={dataset} />
}
