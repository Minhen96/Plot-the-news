'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ManualSyncButton() {
  const [syncing, setSyncing] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const router = useRouter()

  const handleSync = async () => {
    if (syncing) return
    
    setSyncing(true)
    setStatus('Scanning for global events...')
    
    try {
      const res = await fetch('/api/admin/sync', { method: 'POST' })
      const data = await res.json()
      
      if (res.ok) {
        setStatus(`Generated ${data.generated.length} new stories! Reloading...`)
        setTimeout(() => {
          router.refresh()
          setStatus(null)
          setSyncing(false)
        }, 2000)
      } else {
        setStatus('Sync failed. Check API keys.')
        setTimeout(() => setStatus(null), 3000)
        setSyncing(false)
      }
    } catch (err) {
      setStatus('Network error.')
      setTimeout(() => setStatus(null), 3000)
      setSyncing(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-none">
      {status && (
        <div className="bg-surface-container-high/90 backdrop-blur-md px-4 py-2 rounded-lg shadow-lg border border-primary/20 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <p className="font-headline text-[11px] font-black uppercase tracking-widest text-primary">
            {status}
          </p>
        </div>
      )}
      
      <button
        onClick={handleSync}
        disabled={syncing}
        className={`
          pointer-events-auto group relative flex items-center gap-3 px-5 py-3 
          bg-primary text-on-primary rounded-full shadow-[0_12px_24px_rgba(51,111,84,0.3)]
          hover:shadow-[0_16px_32px_rgba(51,111,84,0.4)] hover:-translate-y-1
          active:translate-y-0 active:shadow-lg transition-all duration-300
          ${syncing ? 'opacity-90 cursor-wait' : 'cursor-pointer'}
        `}
      >
        <span className={`text-xl transition-transform duration-700 ${syncing ? 'animate-spin' : 'group-hover:rotate-180'}`}>
          {syncing ? '◎' : '⚡'}
        </span>
        <span className="font-headline text-[10px] font-black uppercase tracking-[0.2em]">
          {syncing ? 'Ingesting Intel...' : 'Sync Global News'}
        </span>
        
        {/* Subtle pulse effect when idle */}
        {!syncing && (
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping -z-10" />
        )}
      </button>
    </div>
  )
}
