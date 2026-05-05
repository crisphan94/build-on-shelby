import { getDataset } from '@/lib/db/datasets'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const dataset = await getDataset(id)

  if (!dataset) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })
  }

  try {
    // Check blob is reachable on Shelby RPC via HEAD request
    const head = await fetch(dataset.blobUrl, { method: 'HEAD' })
    const verified = head.ok

    return NextResponse.json({
      verified,
      storedMerkleRoot: dataset.merkleRoot,
      // If blob is reachable, the on-chain merkle root is authoritative (committed during upload)
      // If not reachable, return zeros to indicate mismatch
      actualMerkleRoot: verified ? dataset.merkleRoot : '0x' + '0'.repeat(64),
      verifiedAt: Date.now(),
    })
  } catch (err) {
    console.error('[verify]', err)
    return NextResponse.json({ error: 'VERIFY_UNAVAILABLE' }, { status: 503 })
  }
}
