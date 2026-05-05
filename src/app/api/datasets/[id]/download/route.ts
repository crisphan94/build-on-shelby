import { getDataset, incrementDownloadCount } from '@/lib/db/datasets'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const dataset = await getDataset(id)

  if (!dataset) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })
  }

  // Increment count (non-blocking)
  incrementDownloadCount(id).catch(console.error)

  // Redirect directly to the Shelby RPC blob URL so the browser downloads from there
  return NextResponse.redirect(dataset.blobUrl)
}
