import { insertDataset } from '@/lib/db/datasets'
import { uploadBlob } from '@/lib/shelby/client'
import { stringifyTags } from '@/lib/utils'
import { nanoid } from 'nanoid'
import { NextRequest, NextResponse } from 'next/server'

const MAX_BYTES = parseInt(process.env.MAX_UPLOAD_BYTES ?? '5368709120', 10)

// Simple in-memory rate limiter (per IP, resets on server restart)
const uploadCounts = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = parseInt(process.env.UPLOAD_RATE_LIMIT ?? '5', 10)
const RATE_WINDOW_MS = 60 * 60 * 1000 // 1 hour

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = uploadCounts.get(ip)
  if (!entry || now > entry.resetAt) {
    uploadCounts.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return true
  }
  if (entry.count >= RATE_LIMIT) return false
  entry.count++
  return true
}

function getClientIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1'
}

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'RATE_LIMITED', message: 'Too many uploads. Try again later.' },
      { status: 429 },
    )
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json(
      { error: 'INVALID_INPUT', message: 'Expected multipart/form-data' },
      { status: 400 },
    )
  }

  const file = formData.get('file')
  if (!file || typeof file === 'string') {
    return NextResponse.json(
      { error: 'INVALID_INPUT', message: 'No file provided' },
      { status: 400 },
    )
  }

  const name = (formData.get('name') as string | null)?.trim()
  if (!name || name.length < 3 || name.length > 120) {
    return NextResponse.json(
      {
        error: 'INVALID_INPUT',
        message: 'Name must be 3–120 characters',
      },
      { status: 400 },
    )
  }

  const description = (formData.get('description') as string | null)?.trim()?.slice(0, 2000) ?? null

  const rawTags = (formData.get('tags') as string | null) ?? ''
  const tags = rawTags
    .split(',')
    .map((t) => t.trim().toLowerCase().slice(0, 32))
    .filter(Boolean)
    .slice(0, 20)

  const uploaderAddr = (formData.get('uploaderAddr') as string | null)?.trim() || null

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: 'FILE_TOO_LARGE', message: 'File exceeds 5 GB limit' },
      { status: 413 },
    )
  }

  // Convert Blob → Buffer
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  let uploadResult
  try {
    uploadResult = await uploadBlob({
      data: buffer,
      name: file.name,
      contentType: file.type || 'application/octet-stream',
    })
  } catch (err) {
    console.error('[upload] Shelby upload failed:', err)
    return NextResponse.json(
      { error: 'SHELBY_ERROR', message: 'Failed to upload to Shelby' },
      { status: 500 },
    )
  }

  const id = 'd_' + nanoid(10)

  try {
    await insertDataset({
      id,
      name,
      description,
      tags: stringifyTags(tags),
      sizeBytes: file.size,
      fileName: file.name,
      mimeType: file.type || null,
      merkleRoot: uploadResult.merkleRoot,
      blobUrl: uploadResult.blobUrl,
      uploaderAddr,
      downloadCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
  } catch (err) {
    console.error('[upload] DB insert failed:', err)
    return NextResponse.json(
      { error: 'DB_ERROR', message: 'Failed to register dataset' },
      { status: 500 },
    )
  }

  return NextResponse.json(
    {
      id,
      merkleRoot: uploadResult.merkleRoot,
      blobUrl: uploadResult.blobUrl,
    },
    { status: 201 },
  )
}
