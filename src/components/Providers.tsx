'use client'

import { PrivyProvider } from '@privy-io/react-auth'
import { defineChain } from 'viem'

const dcaiL3 = defineChain({
  id: 18441,
  name: 'DCAI L3 Testnet',
  nativeCurrency: { name: 'tDCAI', symbol: 'tDCAI', decimals: 18 },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_L3_RPC_URL ?? 'http://139.180.140.143/rpc/'],
    },
  },
  blockExplorers: {
    default: {
      name: 'DCAI Explorer',
      url: process.env.NEXT_PUBLIC_L3_EXPLORER ?? 'http://139.180.140.143/',
    },
  },
})

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? ''}
      config={{
        appearance: {
          theme: 'light',
          accentColor: '#336f54',
          logo: undefined,
        },
        loginMethods: ['email', 'google', 'wallet'],
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'users-without-wallets',
          },
        },
        defaultChain: dcaiL3,
        supportedChains: [dcaiL3],
      }}
    >
      {children}
    </PrivyProvider>
  )
}
