'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { hashPrediction } from '@/lib/blockchain'
import type { Directive } from '@/lib/types'

interface Props {
  storyId: string
  predictionOptions: Directive[]
  cliffhanger: string
  characterName: string
  characterPortrait: string
  backgroundUrl: string
}

type LockPhase = null | 'hashing' | 'submitting' | 'locked'

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export default function DirectivesClient({
  storyId,
  predictionOptions,
  cliffhanger,
  characterName,
  characterPortrait,
  backgroundUrl,
}: Props) {
  const router = useRouter()

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [confidence, setConfidence] = useState(75)
  const [customText, setCustomText] = useState('')
  const [lockPhase, setLockPhase] = useState<LockPhase>(null)
  const [txHash, setTxHash] = useState('')
  const [roleId, setRoleId] = useState<string | null>(null)

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('game_role')
      if (stored) setRoleId(JSON.parse(stored).roleId)
    } catch { /* ignore */ }
  }, [])

  const effectiveId = selectedId ?? (customText ? 'custom' : null)
  
  // Find label from options or use customText (will be refined by API)
  const selectedOption = predictionOptions.find(o => o.id === selectedId)
  const effectiveLabel = selectedOption?.label ?? customText

  async function handleLock() {
    if (!effectiveId) return

    const userAddress = 'tester-0x123'
    const timestamp = Date.now()
    
    // Hash prediction for "on-chain" mock
    const hash = hashPrediction(storyId, effectiveId, userAddress, timestamp)
    setTxHash(hash)

    setLockPhase('hashing')
    await delay(800)
    setLockPhase('submitting')

    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyId,
          optionId: effectiveId,
          userAddress,
          confidence,
          justification: customText || undefined,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        // Save to sessionStorage for outcome page
        sessionStorage.setItem('game_prediction', JSON.stringify({
          storyId,
          roleId,
          optionId: data.prediction.optionId,
          optionLabel: data.prediction.optionLabel,
          confidence,
          justification: customText || undefined,
          txHash: hash,
        }))
      }
    } catch (err) {
      console.error('Prediction failed:', err)
    }

    await delay(800)
    setLockPhase('locked')
    await delay(1000)
    router.push(`/story/${storyId}/outcome`)
  }

  // Split options into Official vs Community
  const officialOptions = predictionOptions.filter(o => !o.id.startsWith('community-'))
  const communityOptions = predictionOptions.filter(o => o.id.startsWith('community-'))

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col">
      {/* Fixed background */}
      <div className="fixed inset-0 z-0">
        {backgroundUrl ? (
          <img src={backgroundUrl} alt="" className="w-full h-full object-cover brightness-75 grayscale-[20%]" />
        ) : (
          <div className="w-full h-full bg-slate-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent" />
      </div>

      {/* Header */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-8 py-4 bg-surface/60 backdrop-blur-xl border-b border-white/5">
        <div className="text-2xl font-black text-primary italic font-headline tracking-tight">
          FutureLens <span className="text-on-surface/50 font-normal not-italic ml-2">strategic intel</span>
        </div>
        <div className="hidden md:flex gap-8 items-center">
          <Link href="/" className="text-on-surface font-medium font-headline hover:text-primary transition-colors uppercase tracking-widest text-[11px]">Chronicle</Link>
          <div className="h-4 w-px bg-white/10" />
          <Link href="/archive" className="text-on-surface/60 font-medium font-headline hover:text-primary transition-colors uppercase tracking-widest text-[11px]">Archives</Link>
        </div>
      </nav>

      {/* Main */}
      <main className="flex-grow pt-24 pb-48 flex flex-col items-center relative z-10">
        <section className="w-full max-w-6xl px-6">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full font-headline text-[10px] font-bold tracking-[0.3em] mb-4 uppercase">
              Phase 03: Strategic Directive
            </span>
            <h2 className="font-headline text-5xl font-black text-on-surface tracking-tighter mb-4 uppercase italic">
              Deploy Your Consensus
            </h2>
            <p className="text-on-surface-variant font-medium text-lg max-w-2xl mx-auto opacity-70">
              Select an established baseline or contribute a unique strategic projection to the network.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Directives List */}
            <div className="lg:col-span-8 flex flex-col gap-12">
              
              {/* Official Section */}
              <div>
                <h3 className="font-headline text-xs font-black tracking-[0.4em] text-primary mb-6 flex items-center gap-3 uppercase">
                  <span className="w-8 h-px bg-primary/30" /> Baseline Projections
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {officialOptions.map(option => (
                    <DirectiveCard
                      key={option.id}
                      option={option}
                      isSelected={selectedId === option.id}
                      onSelect={() => {
                        setSelectedId(selectedId === option.id ? null : option.id)
                        setCustomText('')
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Community Section */}
              {communityOptions.length > 0 && (
                <div>
                  <h3 className="font-headline text-xs font-black tracking-[0.4em] text-secondary mb-6 flex items-center gap-3 uppercase">
                    <span className="w-8 h-px bg-secondary/30" /> Community Insights
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {communityOptions.map(option => (
                      <DirectiveCard
                        key={option.id}
                        option={option}
                        isSelected={selectedId === option.id}
                        isCommunity
                        onSelect={() => {
                          setSelectedId(selectedId === option.id ? null : option.id)
                          setCustomText('')
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Author Sidebar */}
            <div className="lg:col-span-4 sticky top-28">
              <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-2xl p-8 shadow-2xl overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-primary/20 transition-colors" />
                
                <h4 className="font-headline font-black text-xs text-primary uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                  <span className="p-1.5 bg-primary/10 rounded-lg">🖋</span> Contribute Intelligence
                </h4>
                
                <p className="text-[13px] text-on-surface-variant mb-6 leading-relaxed opacity-70">
                  Submit a custom outcome. Our strategic AI will refine your input into a professional directive for the network to verify.
                </p>

                <textarea
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm font-body placeholder:text-white/20 focus:ring-1 focus:ring-primary focus:border-primary/50 mb-4 resize-none min-h-[160px] transition-all"
                  placeholder="Describe the geopolitical shift..."
                  value={customText}
                  onChange={e => {
                    setCustomText(e.target.value)
                    if (e.target.value) setSelectedId(null)
                  }}
                />

                <button
                  className="w-full py-4 bg-primary text-on-primary rounded-xl font-headline font-black text-[11px] uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 disabled:grayscale"
                  disabled={!customText.trim() || lockPhase !== null}
                  onClick={() => customText.trim() && handleLock()}
                >
                  SYNDICATE TO NETWORK
                </button>
              </div>
            </div>
          </div>

          {/* HUD Bar */}
          <div className="mt-16 p-8 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl">
            <div className="flex-grow flex flex-col md:flex-row items-center gap-10 w-full md:w-auto px-4">
              <div className="flex flex-col gap-1 min-w-[140px]">
                <label className="font-headline font-black text-[10px] text-primary uppercase tracking-widest">
                  Confidence
                </label>
                <span className="text-3xl font-black italic tracking-tighter text-on-surface">{confidence}%</span>
              </div>
              
              <div className="relative flex-grow h-12 flex items-center">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={confidence}
                  onChange={e => setConfidence(Number(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-primary"
                />
              </div>
            </div>

            <div className="w-full md:w-auto">
              {lockPhase === null ? (
                <button
                  className="w-full md:w-auto px-12 py-5 bg-on-surface text-surface rounded-2xl font-headline font-black tracking-[0.3em] text-xs flex items-center justify-center gap-3 hover:bg-primary hover:text-on-primary transition-all disabled:opacity-20 shadow-xl"
                  disabled={!effectiveId}
                  onClick={handleLock}
                >
                  <span className="text-lg">🔒</span> COMMENCE RECORDING
                </button>
              ) : (
                <div className="w-full md:w-80 py-5 bg-primary/20 border border-primary/30 text-primary rounded-2xl font-headline font-black tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 shadow-inner">
                  {lockPhase === 'hashing' && <span className="animate-pulse">⚙ HASHING DATA...</span>}
                  {lockPhase === 'submitting' && <span className="animate-pulse">📡 TRANSMITTING TO CHAIN...</span>}
                  {lockPhase === 'locked' && <>✅ {txHash.slice(0, 16).toUpperCase()}</>}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Narrative Anchor */}
        <div className="mt-20 w-full max-w-5xl px-6">
          <div className="bg-black/60 backdrop-blur-xl border border-white/5 rounded-3xl p-10 flex flex-col md:flex-row gap-10 items-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary shadow-2xl">
                {characterPortrait ? (
                  <img src={characterPortrait} alt={characterName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-primary/20" />
                )}
              </div>
            </div>
            <div className="flex-grow text-center md:text-left">
              <span className="font-headline font-black text-[10px] uppercase tracking-[0.4em] text-primary mb-3 block">Strategy Lead: {characterName}</span>
              <p className="font-body text-2xl md:text-3xl text-on-surface leading-snug italic font-medium opacity-90">
                &ldquo;{cliffhanger}&rdquo;
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function DirectiveCard({ option, isSelected, onSelect, isCommunity = false }: { 
  option: Directive, 
  isSelected: boolean, 
  onSelect: () => void,
  isCommunity?: boolean
}) {
  return (
    <div
      className={`relative group p-8 rounded-2xl flex flex-col justify-between h-80 cursor-pointer transition-all duration-300 ${
        isSelected
          ? 'bg-primary/20 border-2 border-primary shadow-[0_0_40px_rgba(51,111,84,0.3)]'
          : 'bg-white/5 border border-white/10 hover:border-white/30 hover:bg-white/[0.08]'
      }`}
      onClick={onSelect}
    >
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${isCommunity ? 'bg-secondary/20 text-secondary' : 'bg-primary/20 text-primary'}`}>
            {isCommunity ? '👤' : '🏢'}
          </div>
          <span className="font-headline font-bold text-[10px] text-on-surface/40 uppercase tracking-widest italic">
            ID: {option.id.slice(0, 8)}
          </span>
        </div>
        
        <h3 className="font-headline font-black text-2xl text-on-surface mb-3 leading-tight tracking-tighter uppercase italic">
          {option.label}
        </h3>
        <p className="text-on-surface/60 text-sm leading-relaxed font-medium">
          {option.description}
        </p>
      </div>

      <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-black text-on-surface/30 uppercase tracking-[0.1em]">PROPOSED BY</span>
          <span className="text-[11px] font-black text-on-surface/70 truncate max-w-[120px] uppercase">
             {option.proposedBy === 'system' ? 'Strategic AI' : option.proposedBy}
          </span>
        </div>
        <div className={`px-4 py-2 rounded-lg text-[10px] font-black font-headline transition-all ${
          isSelected ? 'bg-primary text-on-primary' : 'bg-white/10 text-on-surface/50 group-hover:bg-white/20'
        }`}>
          {isSelected ? 'SELECTED' : 'SELECT'}
        </div>
      </div>
    </div>
  )
}
