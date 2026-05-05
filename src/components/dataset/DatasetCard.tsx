import {
  formatBytes,
  formatRelativeDate,
  getMimeColors,
  getMimeLabel,
  parseTags,
} from '@/lib/utils'
import type { Dataset } from '@/types/dataset'
import { Download } from 'lucide-react'
import Link from 'next/link'

interface DatasetCardProps {
  dataset: Dataset
}

export function DatasetCard({ dataset }: DatasetCardProps) {
  const tags = parseTags(dataset.tags)
  const mimeLabel = getMimeLabel(dataset.mimeType)
  const mimeColors = getMimeColors(dataset.mimeType)

  return (
    <Link href={`/dataset/${dataset.id}`} className='group block'>
      <div className='relative h-full bg-slate-800 rounded-xl border border-slate-700 p-6 hover:border-indigo-500/50 hover:bg-slate-800/80 transition-all duration-200 cursor-pointer flex flex-col'>
        {/* Gradient accent on hover */}
        <div className='absolute inset-x-0 top-0 h-0.5 rounded-t-xl bg-gradient-to-r from-indigo-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200' />

        {/* Header: MIME badge + size */}
        <div className='flex items-center justify-between mb-4'>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono font-medium border ${mimeColors}`}
          >
            {mimeLabel}
          </span>
          <span className='text-xs text-slate-400 font-mono'>{formatBytes(dataset.sizeBytes)}</span>
        </div>

        {/* Name */}
        <h3 className='text-base font-semibold text-slate-100 line-clamp-2 mb-2 group-hover:text-white transition-colors'>
          {dataset.name}
        </h3>

        {/* Description */}
        <p className='text-sm text-slate-400 line-clamp-2 mb-4 flex-1'>
          {dataset.description ?? 'No description provided.'}
        </p>

        {/* Tags */}
        {tags.length > 0 && (
          <div className='flex flex-wrap gap-1.5 mb-4'>
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className='inline-flex items-center px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-medium text-indigo-300'
              >
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className='text-xs text-slate-500 self-center'>+{tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className='flex items-center justify-between text-xs text-slate-500'>
          <span className='flex items-center gap-1'>
            <Download className='w-3.5 h-3.5' />
            {dataset.downloadCount.toLocaleString()}
          </span>
          <span>{formatRelativeDate(dataset.createdAt)}</span>
        </div>
      </div>
    </Link>
  )
}

export function DatasetCardSkeleton() {
  return (
    <div className='bg-slate-800 rounded-xl border border-slate-700 p-6 animate-pulse flex flex-col gap-4'>
      <div className='flex items-center justify-between'>
        <div className='h-5 w-14 bg-slate-700 rounded-md' />
        <div className='h-4 w-12 bg-slate-700 rounded' />
      </div>
      <div className='space-y-2'>
        <div className='h-5 w-3/4 bg-slate-700 rounded' />
        <div className='h-4 w-full bg-slate-700 rounded' />
        <div className='h-4 w-2/3 bg-slate-700 rounded' />
      </div>
      <div className='flex gap-2'>
        <div className='h-5 w-14 bg-slate-700 rounded-full' />
        <div className='h-5 w-10 bg-slate-700 rounded-full' />
      </div>
      <div className='flex justify-between'>
        <div className='h-3 w-12 bg-slate-700 rounded' />
        <div className='h-3 w-16 bg-slate-700 rounded' />
      </div>
    </div>
  )
}
