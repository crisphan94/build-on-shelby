import { and, count, desc, eq, like, or, sql } from 'drizzle-orm'
import { db } from './client'
import { datasets, type Dataset, type NewDataset } from './schema'

export interface ListDatasetsOptions {
  page?: number
  limit?: number
  q?: string
  tag?: string
  sort?: 'created_at' | 'download_count' | 'size_bytes'
  order?: 'asc' | 'desc'
}

export async function listDatasets(opts: ListDatasetsOptions = {}) {
  const { page = 1, limit = 20, q, tag, sort = 'created_at', order = 'desc' } = opts

  const offset = (page - 1) * limit

  const conditions = []

  if (q) {
    conditions.push(or(like(datasets.name, `%${q}%`), like(datasets.description, `%${q}%`)))
  }

  if (tag) {
    // Case-insensitive search within the JSON array string
    conditions.push(sql`lower(${datasets.tags}) LIKE lower(${'%"' + tag + '"%'})`)
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined

  const sortColumn =
    sort === 'download_count'
      ? datasets.downloadCount
      : sort === 'size_bytes'
        ? datasets.sizeBytes
        : datasets.createdAt

  const [rows, totalRows] = await Promise.all([
    db
      .select()
      .from(datasets)
      .where(where)
      .orderBy(order === 'desc' ? desc(sortColumn) : sortColumn)
      .limit(limit)
      .offset(offset),
    db.select({ count: count() }).from(datasets).where(where),
  ])

  const total = totalRows[0]?.count ?? 0

  return {
    data: rows,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export async function getDataset(id: string): Promise<Dataset | null> {
  const rows = await db.select().from(datasets).where(eq(datasets.id, id)).limit(1)
  return rows[0] ?? null
}

export async function insertDataset(data: NewDataset): Promise<Dataset> {
  const rows = await db.insert(datasets).values(data).returning()
  return rows[0]
}

export async function incrementDownloadCount(id: string): Promise<void> {
  await db
    .update(datasets)
    .set({
      downloadCount: sql`${datasets.downloadCount} + 1`,
      updatedAt: Date.now(),
    })
    .where(eq(datasets.id, id))
}

export async function getAllTags(): Promise<{ tag: string; count: number }[]> {
  const rows = await db.select({ tags: datasets.tags }).from(datasets)
  const tagMap = new Map<string, number>()
  for (const row of rows) {
    try {
      const tags: string[] = JSON.parse(row.tags)
      for (const t of tags) {
        tagMap.set(t, (tagMap.get(t) ?? 0) + 1)
      }
    } catch {
      // skip invalid JSON
    }
  }
  return Array.from(tagMap.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
}
