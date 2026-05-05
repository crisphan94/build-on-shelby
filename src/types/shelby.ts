// Shelby SDK types (matches @shelby/sdk interface when available)
export interface ShelbyUploadOptions {
  data: Buffer
  name: string
  contentType?: string
  durationDays?: number
}

export interface ShelbyUploadResult {
  merkleRoot: string
  blobUrl: string
  chunksetCommitments: string[]
}

export interface ShelbyVerifyResult {
  verified: boolean
  storedMerkleRoot: string
  actualMerkleRoot: string
}
