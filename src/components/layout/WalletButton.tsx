'use client'

import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { Button } from '@/components/ui/Button'
import { Wallet, ChevronDown, LogOut, ExternalLink } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

export function WalletButton() {
  const { connected, account, wallets, notDetectedWallets, connect, disconnect } = useWallet()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (connected && account) {
    const addr = String(account.address)
    const truncated = addr.slice(0, 6) + '…' + addr.slice(-4)
    return (
      <div ref={ref} className='relative'>
        <button
          onClick={() => setOpen(!open)}
          className='flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-sm text-slate-200 transition-colors'
          aria-label='Wallet menu'
        >
          <div className='w-2 h-2 rounded-full bg-green-400 shrink-0' />
          <span className='font-mono text-xs'>{truncated}</span>
          <ChevronDown className='w-3 h-3 text-slate-500' />
        </button>

        {open && (
          <div className='absolute right-0 top-full mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-xl p-1 min-w-[200px] z-50'>
            <div className='px-3 py-2 border-b border-slate-700 mb-1'>
              <p className='text-xs text-slate-500 mb-0.5'>Connected</p>
              <p className='text-xs font-mono text-slate-300 break-all'>{addr}</p>
            </div>
            <a
              href={`https://explorer.aptoslabs.com/account/${addr}?network=testnet`}
              target='_blank'
              rel='noopener noreferrer'
              onClick={() => setOpen(false)}
              className='flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded-lg transition-colors'
            >
              <ExternalLink className='w-3.5 h-3.5' />
              View on Explorer
            </a>
            <button
              onClick={() => {
                disconnect()
                setOpen(false)
              }}
              className='flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-slate-700 rounded-lg transition-colors'
            >
              <LogOut className='w-3.5 h-3.5' />
              Disconnect
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div ref={ref} className='relative'>
      <Button variant='outline' size='md' onClick={() => setOpen(!open)} className='shrink-0'>
        <Wallet className='w-4 h-4' />
        <span className='hidden sm:inline'>Connect Wallet</span>
      </Button>

      {open && (
        <div className='absolute right-0 top-full mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-xl p-2 min-w-[220px] z-50'>
          {wallets.length > 0 ? (
            <>
              <p className='text-xs text-slate-500 px-2 py-1 mb-1'>Select wallet</p>
              {wallets.map((wallet) => (
                <button
                  key={wallet.name}
                  onClick={() => {
                    connect(wallet.name)
                    setOpen(false)
                  }}
                  className='flex items-center gap-2.5 w-full px-3 py-2 text-sm text-slate-200 hover:bg-slate-700 rounded-lg transition-colors'
                >
                  {wallet.icon && (
                    <img
                      src={wallet.icon}
                      alt={wallet.name}
                      className='w-5 h-5 rounded-md object-contain'
                    />
                  )}
                  {wallet.name}
                </button>
              ))}
            </>
          ) : (
            <div className='px-3 py-3 text-center'>
              <Wallet className='w-8 h-8 text-slate-600 mx-auto mb-2' />
              <p className='text-xs text-slate-400 mb-2'>No Aptos wallet detected.</p>
              <a
                href='https://petra.app'
                target='_blank'
                rel='noopener noreferrer'
                className='text-xs text-indigo-400 hover:text-indigo-300 underline'
                onClick={() => setOpen(false)}
              >
                Install Petra Wallet →
              </a>
              {notDetectedWallets.length > 0 && (
                <div className='mt-3 pt-3 border-t border-slate-700 space-y-1'>
                  {notDetectedWallets.map((w) => (
                    <a
                      key={w.name}
                      href={w.url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 transition-colors'
                      onClick={() => setOpen(false)}
                    >
                      {w.icon && <img src={w.icon} alt={w.name} className='w-4 h-4 rounded' />}
                      Install {w.name}
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
