import { getDataset, incrementDownloadCount } from '@/lib/db/datasets'
import { downloadBlob } from '@/lib/shelby/client'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const dataset = await getDataset(id)

  if (!dataset) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })
  }

  try {
    const buffer = await downloadBlob(dataset.blobUrl)

    // Increment count (non-blocking)
    incrementDownloadCount(id).catch(console.error)

    const headers = new Headers()
    headers.set(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(dataset.fileName)}"`,
    )
    headers.set('Content-Type', dataset.mimeType ?? 'application/octet-stream')
    headers.set('Content-Length', String(buffer.length))

    return new NextResponse(buffer as unknown as BodyInit, { headers })
  } catch (err) {
    console.error('[download]', err)
    return NextResponse.json(
      { error: 'DOWNLOAD_FAILED', message: 'Failed to download from Shelby' },
      { status: 502 },
    )
  }
}
