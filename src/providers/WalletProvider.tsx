'use client'

import { AptosWalletAdapterProvider } from '@aptos-labs/wallet-adapter-react'
import { Network } from '@aptos-labs/ts-sdk'
import { type PropsWithChildren } from 'react'

export function WalletProvider({ children }: PropsWithChildren) {
  return (
    <AptosWalletAdapterProvider
      autoConnect={false}
      dappConfig={{
        network: Network.TESTNET,
        aptosApiKeys: {
          testnet: process.env.NEXT_PUBLIC_APTOS_API_KEY,
        },
      }}
      onError={(error) => {
        console.error('[WalletProvider]', error)
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  )
}
