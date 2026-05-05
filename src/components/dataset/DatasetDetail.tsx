'use client'

import { Button } from '@/components/ui/Button'
import { formatBytes, formatRelativeDate, parseTags, truncateHash } from '@/lib/utils'
import type { Dataset, VerifyResult } from '@/types/dataset'
import { AlertTriangle, CheckCircle2, Copy, Download, Loader2, XCircle } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

interface DatasetDetailProps {
  dataset: Dataset
}

export function DatasetDetail({ dataset }: DatasetDetailProps) {
  const tags = parseTags(dataset.tags)
  const [verifyState, setVerifyState] = useState<'idle' | 'loading' | 'success' | 'fail' | 'error'>(
    'idle',
  )
  const [verifyResult, setVerifyResult] = useState<VerifyResult | null>(null)
  const [copied, setCopied] = useState(false)

  async function handleVerify() {
    setVerifyState('loading')
    try {
      const res = await fetch(`/api/datasets/${dataset.id}/verify`)
      const data: VerifyResult = await res.json()
      setVerifyResult(data)
      setVerifyState(data.verified ? 'success' : 'fail')
    } catch {
      setVerifyState('error')
    }
  }

  function copyHash() {
    navigator.clipboard.writeText(dataset.merkleRoot)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className='max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      {/* Breadcrumb */}
      <nav className='flex items-center gap-2 text-sm text-slate-500 mb-6'>
        <Link href='/' className='hover:text-slate-300 transition-colors'>
          Catalog
        </Link>
        <span>/</span>
        <span className='text-slate-300 truncate max-w-xs'>{dataset.name}</span>
      </nav>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        {/* Left: metadata */}
        <div className='lg:col-span-2 space-y-6'>
          <div>
            <h1 className='text-2xl font-bold text-slate-100 mb-2'>{dataset.name}</h1>
            {dataset.description && (
              <p className='text-slate-400 leading-relaxed'>{dataset.description}</p>
            )}
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className='flex flex-wrap gap-2'>
              {tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/?tag=${encodeURIComponent(tag)}`}
                  className='inline-flex items-center px-2.5 py-0.5 rounded-full bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 hover:border-indigo-500/40 text-xs font-medium text-indigo-300 transition-colors cursor-pointer'
                >
                  {tag}
                </Link>
              ))}
            </div>
          )}

          {/* Metadata table */}
          <div className='bg-slate-800 rounded-xl border border-slate-700 overflow-hidden'>
            <table className='w-full text-sm'>
              <tbody className='divide-y divide-slate-700'>
                <MetaRow label='Dataset ID' value={dataset.id} mono />
                <MetaRow label='File Name' value={dataset.fileName} />
                <MetaRow label='Type' value={dataset.mimeType ?? 'Unknown'} />
                <MetaRow label='Size' value={formatBytes(dataset.sizeBytes)} />
                <MetaRow label='Downloads' value={dataset.downloadCount.toLocaleString()} />
                <MetaRow label='Uploaded' value={formatRelativeDate(dataset.createdAt)} />
                <MetaRow
                  label='Uploader'
                  value={dataset.uploaderAddr ?? 'Anonymous'}
                  mono={!!dataset.uploaderAddr}
                />
              </tbody>
            </table>
          </div>

          {/* Merkle Root */}
          <div className='bg-slate-800 rounded-xl border border-slate-700 p-4'>
            <div className='flex items-center justify-between mb-2'>
              <span className='text-xs font-medium text-slate-400 uppercase tracking-wide'>
                Merkle Root
              </span>
              <button
                onClick={copyHash}
                aria-label='Copy Merkle root'
                className='flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors cursor-pointer'
              >
                <Copy className='w-3.5 h-3.5' />
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <code className='text-xs font-mono text-slate-300 break-all'>{dataset.merkleRoot}</code>
          </div>
        </div>

        {/* Right: actions */}
        <div className='space-y-4'>
          {/* Download */}
          <a href={`/api/datasets/${dataset.id}/download`} download>
            <Button variant='accent' size='lg' className='w-full'>
              <Download className='w-5 h-5' />
              Download Dataset
            </Button>
          </a>

          {/* Verify */}
          <div className='bg-slate-800 rounded-xl border border-slate-700 p-4 mt-4'>
            <p className='text-sm font-medium text-slate-200 mb-1'>Verify Integrity</p>
            <p className='text-xs text-slate-500 mb-4'>
              Check that this dataset&apos;s Merkle root matches Shelby&apos;s on-chain commitment.
            </p>

            {verifyState === 'idle' && (
              <Button variant='secondary' size='md' className='w-full' onClick={handleVerify}>
                Verify Integrity
              </Button>
            )}

            {verifyState === 'loading' && (
              <Button variant='secondary' size='md' className='w-full' disabled>
                <Loader2 className='w-4 h-4 animate-spin' />
                Verifying…
              </Button>
            )}

            {verifyState === 'success' && verifyResult && (
              <VerifySuccess result={verifyResult} onRetry={handleVerify} />
            )}

            {verifyState === 'fail' && verifyResult && (
              <VerifyFail result={verifyResult} onRetry={handleVerify} />
            )}

            {verifyState === 'error' && <VerifyError onRetry={handleVerify} />}
          </div>
        </div>
      </div>
    </div>
  )
}

function MetaRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <tr>
      <td className='px-4 py-3 text-slate-400 whitespace-nowrap w-32'>{label}</td>
      <td className={`px-4 py-3 text-slate-200 break-all ${mono ? 'font-mono text-xs' : ''}`}>
        {value}
      </td>
    </tr>
  )
}

function VerifySuccess({ result, onRetry }: { result: VerifyResult; onRetry: () => void }) {
  return (
    <div className='space-y-3'>
      <div className='flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30'>
        <CheckCircle2 className='w-5 h-5 text-green-400 shrink-0' />
        <div>
          <p className='text-sm font-semibold text-green-400'>Verified ✓</p>
          <p className='text-xs text-slate-400'>Merkle root matches.</p>
        </div>
      </div>
      <div className='space-y-1 text-xs font-mono'>
        <HashRow label='Stored' value={result.storedMerkleRoot} />
        <HashRow label='Actual' value={result.actualMerkleRoot} />
      </div>
      <p className='text-xs text-slate-500'>Verified {formatRelativeDate(result.verifiedAt)}</p>
      <button
        onClick={onRetry}
        className='text-xs text-slate-500 hover:text-slate-400 transition-colors cursor-pointer'
      >
        Re-verify
      </button>
    </div>
  )
}

function VerifyFail({ result, onRetry }: { result: VerifyResult; onRetry: () => void }) {
  return (
    <div className='space-y-3'>
      <div className='flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30'>
        <XCircle className='w-5 h-5 text-red-400 shrink-0 mt-0.5' />
        <div>
          <p className='text-sm font-semibold text-red-400'>Verification Failed ✗</p>
          <p className='text-xs text-slate-400'>This dataset may have been tampered with.</p>
        </div>
      </div>
      <div className='space-y-1 text-xs font-mono'>
        <HashRow label='Stored' value={result.storedMerkleRoot} error />
        <HashRow label='Actual' value={result.actualMerkleRoot} error />
      </div>
      <button
        onClick={onRetry}
        className='text-xs text-slate-500 hover:text-slate-400 transition-colors cursor-pointer'
      >
        Retry
      </button>
    </div>
  )
}

function VerifyError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className='space-y-3'>
      <div className='flex items-center gap-2 p-3 rounded-lg bg-orange-500/10 border border-orange-500/30'>
        <AlertTriangle className='w-5 h-5 text-orange-400 shrink-0' />
        <p className='text-sm text-orange-300'>Verification unavailable. Try again.</p>
      </div>
      <Button variant='secondary' size='md' className='w-full' onClick={onRetry}>
        Retry
      </Button>
    </div>
  )
}

function HashRow({ label, value, error }: { label: string; value: string; error?: boolean }) {
  return (
    <div className='flex gap-2'>
      <span className='text-slate-500 w-12 shrink-0'>{label}</span>
      <span className={`break-all ${error ? 'text-red-400' : 'text-slate-300'}`}>
        {truncateHash(value, 8)}
      </span>
    </div>
  )
}
