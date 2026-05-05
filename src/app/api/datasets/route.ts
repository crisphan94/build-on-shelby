import { getAllTags, listDatasets } from '@/lib/db/datasets'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().optional(),
  tag: z.string().optional(),
  sort: z.enum(['created_at', 'download_count', 'size_bytes']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
  includeTags: z.coerce.boolean().default(false),
})

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const params = Object.fromEntries(request.nextUrl.searchParams.entries())
    const parsed = querySchema.safeParse(params)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'INVALID_QUERY', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const { includeTags, ...listOpts } = parsed.data

    const [result, tags] = await Promise.all([
      listDatasets(listOpts),
      includeTags ? getAllTags() : Promise.resolve(undefined),
    ])

    return NextResponse.json({
      ...result,
      ...(tags !== undefined ? { tags } : {}),
    })
  } catch (err) {
    console.error('[GET /api/datasets]', err)
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 })
  }
}
