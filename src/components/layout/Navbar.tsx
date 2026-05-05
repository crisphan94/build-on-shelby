'use client'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { WalletButton } from '@/components/layout/WalletButton'
import { Database, Search, Upload } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useRef } from 'react'

function NavSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const inputRef = useRef<HTMLInputElement>(null)

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const q = inputRef.current?.value.trim() ?? ''
    const params = new URLSearchParams(searchParams.toString())
    if (q) {
      params.set('q', q)
    } else {
      params.delete('q')
    }
    params.delete('page')
    router.push(`/?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSearch} className='flex-1 max-w-xl'>
      <div className='relative'>
        <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none' />
        <Input
          ref={inputRef}
          type='search'
          placeholder='Search datasets…'
          defaultValue={searchParams.get('q') ?? ''}
          className='pl-9 pr-4'
          aria-label='Search datasets'
        />
      </div>
    </form>
  )
}

export function Navbar() {
  return (
    <nav className='sticky top-0 z-50 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md'>
      <div className='max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex h-16 items-center gap-4'>
          {/* Logo */}
          <Link
            href='/'
            className='flex items-center gap-2 shrink-0 text-slate-100 hover:text-white transition-colors'
            aria-label='DataShelf home'
          >
            <div className='w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center'>
              <Database className='w-4 h-4 text-white' />
            </div>
            <span className='font-semibold text-base hidden sm:block'>DataShelf</span>
          </Link>

          {/* Search */}
          <Suspense
            fallback={
              <div className='flex-1 max-w-xl'>
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none' />
                  <Input
                    type='search'
                    placeholder='Search datasets…'
                    className='pl-9 pr-4'
                    aria-label='Search datasets'
                  />
                </div>
              </div>
            }
          >
            <NavSearch />
          </Suspense>

          {/* Upload CTA */}
          <Link href='/upload'>
            <Button variant='primary' size='md' className='shrink-0'>
              <Upload className='w-4 h-4' />
              <span className='hidden sm:inline'>Upload Dataset</span>
              <span className='sm:hidden'>Upload</span>
            </Button>
          </Link>

          {/* Wallet */}
          <WalletButton />
        </div>
      </div>
    </nav>
  )
}
