import { Button } from '@/components/ui/Button'
import { Database } from 'lucide-react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className='flex flex-col items-center justify-center min-h-[60vh] px-6 text-center'>
      <div className='w-16 h-16 rounded-2xl mb-6 bg-slate-800 border border-slate-700 flex items-center justify-center'>
        <Database className='w-8 h-8 text-slate-500' />
      </div>
      <h1 className='text-2xl font-bold text-slate-100 mb-2'>Dataset not found</h1>
      <p className='text-slate-400 max-w-sm mb-8'>
        This dataset doesn&apos;t exist or may have expired.
      </p>
      <Link href='/'>
        <Button variant='primary'>Browse Catalog</Button>
      </Link>
    </div>
  )
}
