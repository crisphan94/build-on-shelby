/**
 * Shelby SDK client singleton.
 *
 * In MVP, the real @shelby/sdk is mocked because it requires Early Access.
 * When the SDK is available, replace the mock with:
 *   import { ShelbyClient } from "@shelby/sdk";
 *
 * The mock stores blobs in a local in-memory map and generates deterministic
 * Merkle roots so that upload → verify → download works end-to-end locally.
 */

import type { ShelbyUploadOptions, ShelbyUploadResult, ShelbyVerifyResult } from '@/types/shelby'
import crypto from 'crypto'

// In-memory blob store for MVP (keyed by blobUrl)
const blobStore = new Map<string, { data: Buffer; merkleRoot: string }>()

function computeMerkleRoot(data: Buffer): string {
  return '0x' + crypto.createHash('sha256').update(data).digest('hex')
}

function buildBlobUrl(name: string): string {
  const rpc = process.env.SHELBY_RPC_NODE ?? 'shelby://local'
  const slug = name.replace(/[^a-z0-9-_]/gi, '-').toLowerCase()
  return `${rpc}/blobs/${slug}-${Date.now()}`
}

export async function uploadBlob(opts: ShelbyUploadOptions): Promise<ShelbyUploadResult> {
  // TODO: replace with real SDK call when @shelby/sdk is available
  // const client = getShelbyClient();
  // return await client.upload(opts);

  const merkleRoot = computeMerkleRoot(opts.data)
  const blobUrl = buildBlobUrl(opts.name)

  blobStore.set(blobUrl, { data: opts.data, merkleRoot })

  return {
    merkleRoot,
    blobUrl,
    chunksetCommitments: [merkleRoot],
  }
}

export async function downloadBlob(blobUrl: string): Promise<Buffer> {
  // TODO: replace with real SDK call when @shelby/sdk is available

  const entry = blobStore.get(blobUrl)
  if (!entry) {
    throw new Error(`Blob not found in store: ${blobUrl}`)
  }
  return entry.data
}

export async function verifyBlob(
  blobUrl: string,
  storedMerkleRoot: string,
): Promise<ShelbyVerifyResult> {
  // TODO: replace with real SDK call when @shelby/sdk is available

  const entry = blobStore.get(blobUrl)
  if (!entry) {
    // Blob not in local store — simulate network fetch
    return {
      verified: false,
      storedMerkleRoot,
      actualMerkleRoot: '0x' + '0'.repeat(64),
    }
  }

  const actualMerkleRoot = entry.merkleRoot
  return {
    verified: actualMerkleRoot === storedMerkleRoot,
    storedMerkleRoot,
    actualMerkleRoot,
  }
}
