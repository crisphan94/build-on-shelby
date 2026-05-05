'use client'

import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { Network, Aptos, AptosConfig, AccountAddress } from '@aptos-labs/ts-sdk'
import {
  ShelbyClient,
  ShelbyBlobClient,
  generateCommitments,
  createDefaultErasureCodingProvider,
  expectedTotalChunksets,
  ERASURE_CODE_PARAMS,
  type BlobName,
} from '@shelby-protocol/sdk/browser'
import { useCallback, useState } from 'react'
import { nanoid } from 'nanoid'

export type UploadPhase =
  | 'idle'
  | 'encoding'
  | 'signing'
  | 'confirming'
  | 'uploading'
  | 'registering'
  | 'done'
  | 'error'

export const UPLOAD_PHASE_LABELS: Record<UploadPhase, string> = {
  idle: 'Ready',
  encoding: 'Encoding file…',
  signing: 'Confirm in wallet…',
  confirming: 'Waiting for on-chain confirmation…',
  uploading: 'Uploading to Shelby network…',
  registering: 'Registering dataset…',
  done: 'Done',
  error: 'Error',
}

export interface ShelbyUploadResult {
  txHash: string
  merkleRoot: string
  blobUrl: string
  datasetId: string
}

const EXPIRATION_MICROS = () => BigInt(Date.now() + 30 * 24 * 60 * 60 * 1000) * BigInt(1000)
const ENCODING = ERASURE_CODE_PARAMS.ClayCode_16Total_10Data_13Helper.enumIndex

export function useShelbyUpload() {
  const { account, signAndSubmitTransaction, network } = useWallet()
  const [phase, setPhase] = useState<UploadPhase>('idle')
  const [error, setError] = useState<string | null>(null)

  const upload = useCallback(
    async (params: {
      file: File
      name: string
      description: string
      tags: string[]
    }): Promise<ShelbyUploadResult> => {
      if (!account?.address) throw new Error('Wallet not connected')

      const apiKey = process.env.NEXT_PUBLIC_SHELBY_API_KEY

      // Detect network from connected wallet
      const networkName = (network?.name ?? 'testnet').toLowerCase()
      const isShelbynet = networkName === 'shelbynet'
      const shelbyRpcBase = isShelbynet
        ? 'https://api.shelbynet.shelby.xyz/shelby'
        : 'https://api.testnet.shelby.xyz/shelby'
      const aptosFullNode =
        network?.url ??
        (isShelbynet
          ? 'https://api.shelbynet.shelby.xyz/v1'
          : 'https://api.testnet.aptoslabs.com/v1')

      // Init Shelby + Aptos clients
      const shelbyClient = new ShelbyClient({
        network: isShelbynet ? Network.SHELBYNET : Network.TESTNET,
        ...(apiKey ? { apiKey } : {}),
      })
      const aptosClient = new Aptos(
        new AptosConfig({ network: Network.CUSTOM, fullnode: aptosFullNode }),
      )

      // Read file once
      const arrayBuffer = await params.file.arrayBuffer()
      const uint8Data = new Uint8Array(arrayBuffer)

      // ── Phase 1: Encode ──────────────────────────────────
      setPhase('encoding')
      const provider = await createDefaultErasureCodingProvider()
      const commitments = await generateCommitments(provider, Buffer.from(arrayBuffer))

      // Unique blob name: datasets/<id>/<filename>
      const id = 'd_' + nanoid(10)
      const safeName = params.file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const blobName = `datasets/${id}/${safeName}` as BlobName

      // ── Phase 2: Build payload & sign tx ─────────────────
      setPhase('signing')
      const payload = ShelbyBlobClient.createRegisterBlobPayload({
        account: AccountAddress.from(String(account.address)),
        blobName,
        blobSize: commitments.raw_data_size,
        blobMerkleRoot: commitments.blob_merkle_root,
        numChunksets: expectedTotalChunksets(commitments.raw_data_size),
        expirationMicros: Number(EXPIRATION_MICROS()),
        encoding: ENCODING,
      })
      const txSubmitted = await signAndSubmitTransaction({ data: payload })

      // ── Phase 3: Wait for on-chain confirmation ───────────
      setPhase('confirming')
      await aptosClient.waitForTransaction({ transactionHash: txSubmitted.hash })

      // ── Phase 4: Upload to Shelby RPC ─────────────────────
      // Shelby RPC needs time to index the on-chain registration.
      // Retry putBlob with exponential backoff (up to ~30s).
      setPhase('uploading')
      const MAX_RETRIES = 8
      const BASE_DELAY_MS = 1500
      let lastPutError: unknown
      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        if (attempt > 0) {
          await new Promise((r) => setTimeout(r, BASE_DELAY_MS * Math.pow(1.5, attempt - 1)))
        }
        try {
          await shelbyClient.rpc.putBlob({
            account: AccountAddress.from(String(account.address)),
            blobName,
            blobData: uint8Data,
          })
          lastPutError = undefined
          break
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err)
          // Only retry on "not registered" errors; fail fast on others
          if (!msg.includes('not been registered')) throw err
          lastPutError = err
        }
      }
      if (lastPutError) throw lastPutError

      const blobUrl = `${shelbyRpcBase}/v1/blobs/${account.address}/${encodeURIComponent(blobName)}`

      // ── Phase 5: Register in DataShelf DB ─────────────────
      setPhase('registering')
      const res = await fetch('/api/datasets/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          name: params.name,
          description: params.description,
          tags: params.tags,
          fileName: params.file.name,
          sizeBytes: params.file.size,
          mimeType: params.file.type || null,
          merkleRoot: commitments.blob_merkle_root,
          blobUrl,
          uploaderAddr: String(account.address),
          txHash: txSubmitted.hash,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Failed to register dataset' }))
        throw new Error(err.message ?? 'Failed to register dataset')
      }

      setPhase('done')
      return {
        txHash: txSubmitted.hash,
        merkleRoot: commitments.blob_merkle_root,
        blobUrl,
        datasetId: id,
      }
    },
    [account, signAndSubmitTransaction, network],
  )

  const reset = useCallback(() => {
    setPhase('idle')
    setError(null)
  }, [])

  return { upload, phase, setPhase, error, setError, reset }
}
