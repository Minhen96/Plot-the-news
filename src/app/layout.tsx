import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Newsreader } from 'next/font/google'
import Providers from '@/components/Providers'
import ManualSyncButton from '@/components/ManualSyncButton'
import './globals.css'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

const newsreader = Newsreader({
  subsets: ['latin'],
  variable: '--font-newsreader',
  style: ['normal', 'italic'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Plot the News! — Turning News into Action',
  description:
    'Read editorial. Pick a role. Lock a prediction on-chain. See the AI-simulated future unfold.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${newsreader.variable}`}>
      <body className="bg-surface text-on-surface font-body antialiased min-h-screen">
        <Providers>
          {children}
          <ManualSyncButton />
        </Providers>
      </body>
    </html>
  )
}
