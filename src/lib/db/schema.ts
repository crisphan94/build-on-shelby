import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const datasets = sqliteTable('datasets', {
  id: text('id').primaryKey(), // nanoid prefixed: "d_xxx"
  name: text('name').notNull(),
  description: text('description'),
  tags: text('tags').notNull().default('[]'), // JSON array string
  sizeBytes: integer('size_bytes').notNull(),
  fileName: text('file_name').notNull(),
  mimeType: text('mime_type'),
  merkleRoot: text('merkle_root').notNull(),
  blobUrl: text('blob_url').notNull().unique(),
  uploaderAddr: text('uploader_addr'),
  txHash: text('tx_hash'),
  downloadCount: integer('download_count').notNull().default(0),
  createdAt: integer('created_at')
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  updatedAt: integer('updated_at')
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
})

export type Dataset = typeof datasets.$inferSelect
export type NewDataset = typeof datasets.$inferInsert
