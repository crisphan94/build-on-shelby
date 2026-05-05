'use client'

import { DatasetCard, DatasetCardSkeleton } from '@/components/dataset/DatasetCard'
import { Button } from '@/components/ui/Button'
import type { Dataset, PaginatedResponse } from '@/types/dataset'
import { ChevronLeft, ChevronRight, Database, Filter, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

interface TagCount {
  tag: string
  count: number
}

interface CatalogData extends PaginatedResponse<Dataset> {
  tags?: TagCount[]
}

const SORT_OPTIONS = [
  { value: 'created_at', label: 'Newest' },
  { value: 'download_count', label: 'Most Downloaded' },
  { value: 'size_bytes_desc', label: 'Largest' },
  { value: 'size_bytes_asc', label: 'Smallest' },
] as const

export function CatalogView() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [data, setData] = useState<CatalogData | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const q = searchParams.get('q') ?? ''
  const tag = searchParams.get('tag') ?? ''
  const sort = searchParams.get('sort') ?? 'created_at'
  const order = searchParams.get('order') ?? 'desc'
  const page = parseInt(searchParams.get('page') ?? '1', 10)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (q) params.set('q', q)
      if (tag) params.set('tag', tag)
      params.set(
        'sort',
        sort === 'size_bytes_asc' || sort === 'size_bytes_desc' ? 'size_bytes' : sort,
      )
      params.set('order', sort === 'size_bytes_asc' ? 'asc' : order)
      params.set('page', String(page))
      params.set('limit', '20')
      params.set('includeTags', 'true')

      const res = await fetch(`/api/datasets?${params.toString()}`)
      const json = await res.json()
      setData(json)
    } finally {
      setLoading(false)
    }
  }, [q, tag, sort, order, page])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete('page')
    router.push(`/?${params.toString()}`)
  }

  const hasFilters = !!(q || tag)
  const allTags = data?.tags ?? []

  return (
    <div className='max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      {/* Header row */}
      <div className='flex items-center justify-between mb-6 gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-slate-100'>
            {q ? `Results for "${q}"` : 'Dataset Catalog'}
          </h1>
          {data && (
            <p className='text-sm text-slate-500 mt-0.5'>
              {loading
                ? 'Loading…'
                : `${data.meta.total.toLocaleString()} dataset${data.meta.total !== 1 ? 's' : ''}`}
              {tag && (
                <span className='ml-2 inline-flex items-center gap-1 text-indigo-400'>
                  tagged &ldquo;{tag}&rdquo;
                </span>
              )}
            </p>
          )}
        </div>

        <div className='flex items-center gap-3 shrink-0'>
          {/* Mobile filter toggle */}
          <Button
            variant='secondary'
            size='sm'
            className='lg:hidden'
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Filter className='w-4 h-4' />
            Filters
          </Button>

          {/* Sort */}
          <select
            value={sort === 'size_bytes' ? `size_bytes_${order}` : sort}
            onChange={(e) => {
              const v = e.target.value
              if (v === 'size_bytes_asc') {
                updateParam('sort', 'size_bytes')
                const p = new URLSearchParams(searchParams.toString())
                p.set('sort', 'size_bytes')
                p.set('order', 'asc')
                p.delete('page')
                router.push(`/?${p.toString()}`)
              } else if (v === 'size_bytes_desc') {
                const p = new URLSearchParams(searchParams.toString())
                p.set('sort', 'size_bytes')
                p.set('order', 'desc')
                p.delete('page')
                router.push(`/?${p.toString()}`)
              } else {
                updateParam('sort', v)
              }
            }}
            className='bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer'
            aria-label='Sort datasets'
          >
            {SORT_OPTIONS.map((o) => (
              <option className='mx-2' key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active filters */}
      {hasFilters && (
        <div className='flex flex-wrap items-center gap-2 mb-6'>
          <span className='text-xs text-slate-500'>Active filters:</span>
          {q && <FilterChip label={`Search: ${q}`} onRemove={() => updateParam('q', null)} />}
          {tag && <FilterChip label={`Tag: ${tag}`} onRemove={() => updateParam('tag', null)} />}
          <button
            onClick={() => {
              const p = new URLSearchParams()
              router.push('/')
            }}
            className='text-xs text-slate-500 hover:text-slate-400 transition-colors cursor-pointer'
          >
            Clear all
          </button>
        </div>
      )}

      <div className='flex gap-8'>
        {/* Sidebar */}
        <aside
          className={`
            lg:block lg:w-56 shrink-0
            ${sidebarOpen ? 'block' : 'hidden'}
            lg:static fixed inset-0 z-40 lg:z-auto
            lg:bg-transparent bg-slate-900/95 lg:p-0 p-6
          `}
        >
          <div className='lg:hidden flex justify-between items-center mb-6'>
            <h2 className='font-semibold text-slate-100'>Filters</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              aria-label='Close filters'
              className='text-slate-400 hover:text-slate-200 cursor-pointer'
            >
              <X className='w-5 h-5' />
            </button>
          </div>

          {allTags.length > 0 && (
            <div>
              <h3 className='text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3'>
                Tags
              </h3>
              <div className='space-y-1'>
                {allTags.map(({ tag: t, count }) => (
                  <button
                    key={t}
                    onClick={() => {
                      updateParam('tag', tag === t ? null : t)
                      setSidebarOpen(false)
                    }}
                    className={`
                      w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-sm text-left transition-colors cursor-pointer
                      ${
                        tag === t
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      }
                    `}
                  >
                    <span>{t}</span>
                    <span className='text-xs opacity-60'>{count}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Grid */}
        <div className='flex-1 min-w-0'>
          {/* Initial load — show skeletons */}
          {loading && !data ? (
            <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6'>
              {Array.from({ length: 9 }).map((_, i) => (
                <DatasetCardSkeleton key={i} />
              ))}
            </div>
          ) : !data || data.data.length === 0 ? (
            <EmptyState hasFilters={hasFilters} />
          ) : (
            <>
              {/* Refetching — keep cards, dim slightly */}
              <div
                className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6'
                style={{ opacity: loading ? 0.5 : 1, transition: 'opacity 150ms ease' }}
              >
                {data.data.map((ds) => (
                  <DatasetCard key={ds.id} dataset={ds} />
                ))}
              </div>

              {/* Pagination */}
              {data.meta.totalPages > 1 && (
                <Pagination
                  page={data.meta.page}
                  totalPages={data.meta.totalPages}
                  onPageChange={(p) => updateParam('page', String(p))}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-xs text-indigo-300'>
      {label}
      <button
        onClick={onRemove}
        aria-label={`Remove filter: ${label}`}
        className='hover:text-white cursor-pointer'
      >
        <X className='w-3 h-3' />
      </button>
    </span>
  )
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  const router = useRouter()
  return (
    <div className='flex flex-col items-center justify-center py-24 px-6 text-center'>
      <div className='w-16 h-16 rounded-2xl mb-6 bg-slate-800 border border-slate-700 flex items-center justify-center'>
        <Database className='w-8 h-8 text-slate-500' />
      </div>
      <h3 className='text-lg font-semibold text-slate-200 mb-2'>No datasets found</h3>
      <p className='text-sm text-slate-400 max-w-sm mb-6'>
        {hasFilters
          ? 'Try adjusting your search or filters.'
          : 'Be the first to upload a dataset to DataShelf.'}
      </p>
      {hasFilters ? (
        <Button variant='secondary' onClick={() => router.push('/')}>
          Clear filters
        </Button>
      ) : (
        <Button variant='primary' onClick={() => router.push('/upload')}>
          Upload Dataset
        </Button>
      )}
    </div>
  )
}

function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number
  totalPages: number
  onPageChange: (p: number) => void
}) {
  return (
    <div className='flex items-center justify-center gap-3 mt-10'>
      <Button
        variant='secondary'
        size='sm'
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        aria-label='Previous page'
      >
        <ChevronLeft className='w-4 h-4' />
        Prev
      </Button>
      <span className='text-sm text-slate-400'>
        Page {page} of {totalPages}
      </span>
      <Button
        variant='secondary'
        size='sm'
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        aria-label='Next page'
      >
        Next
        <ChevronRight className='w-4 h-4' />
      </Button>
    </div>
  )
}
