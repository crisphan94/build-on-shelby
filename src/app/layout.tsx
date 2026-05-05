import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'
import { WalletProvider } from '@/providers/WalletProvider'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'DataShelf — AI Dataset Registry on Shelby',
  description:
    'Discover, verify, and download AI training datasets powered by Shelby decentralized storage.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en' className={`${inter.className} h-full`}>
      <body className='min-h-full flex flex-col bg-[#0f172a] text-slate-100'>
        <WalletProvider>
          <Navbar />
          <main className='flex-1'>{children}</main>
        </WalletProvider>
      </body>
    </html>
  )
}
