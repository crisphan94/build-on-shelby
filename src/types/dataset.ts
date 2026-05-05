export interface Dataset {
  id: string
  name: string
  description: string | null
  tags: string // JSON array string
  sizeBytes: number
  fileName: string
  mimeType: string | null
  merkleRoot: string
  blobUrl: string
  uploaderAddr: string | null
  downloadCount: number
  createdAt: number
  updatedAt: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface VerifyResult {
  verified: boolean
  storedMerkleRoot: string
  actualMerkleRoot: string
  verifiedAt: number
}
