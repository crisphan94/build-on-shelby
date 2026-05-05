import { insertDataset } from '@/lib/db/datasets'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

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

const bodySchema = z.object({
  id: z.string().min(1).max(32),
  name: z.string().min(3).max(120),
  description: z.string().max(2000).nullable().optional(),
  tags: z.array(z.string().max(32)).max(20).default([]),
  fileName: z.string().min(1).max(255),
  sizeBytes: z.number().int().positive(),
  mimeType: z.string().max(100).nullable().optional(),
  merkleRoot: z.string().min(1),
  blobUrl: z.string().url(),
  uploaderAddr: z.string().nullable().optional(),
  txHash: z.string().nullable().optional(),
})

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'RATE_LIMITED', message: 'Too many uploads. Try again later.' },
      { status: 429 },
    )
  }

  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'INVALID_INPUT', message: 'Expected JSON body' },
      { status: 400 },
    )
  }

  const parsed = bodySchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'INVALID_INPUT', message: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 },
    )
  }

  const {
    id,
    name,
    description,
    tags,
    fileName,
    sizeBytes,
    mimeType,
    merkleRoot,
    blobUrl,
    uploaderAddr,
    txHash,
  } = parsed.data

  try {
    await insertDataset({
      id,
      name,
      description: description ?? null,
      tags: JSON.stringify(tags),
      sizeBytes,
      fileName,
      mimeType: mimeType ?? null,
      merkleRoot,
      blobUrl,
      uploaderAddr: uploaderAddr ?? null,
      txHash: txHash ?? null,
    })
  } catch (err) {
    console.error('[upload] DB insert failed:', err)
    return NextResponse.json(
      { error: 'DB_ERROR', message: 'Failed to save dataset' },
      { status: 500 },
    )
  }

  return NextResponse.json({ id, merkleRoot, blobUrl }, { status: 201 })
}
