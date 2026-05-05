import { getDataset } from '@/lib/db/datasets'
import { verifyBlob } from '@/lib/shelby/client'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const dataset = await getDataset(id)

  if (!dataset) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })
  }

  try {
    const result = await verifyBlob(dataset.blobUrl, dataset.merkleRoot)
    return NextResponse.json({
      verified: result.verified,
      storedMerkleRoot: result.storedMerkleRoot,
      actualMerkleRoot: result.actualMerkleRoot,
      verifiedAt: Date.now(),
    })
  } catch (err) {
    console.error('[verify]', err)
    return NextResponse.json({ error: 'VERIFY_UNAVAILABLE' }, { status: 503 })
  }
}
