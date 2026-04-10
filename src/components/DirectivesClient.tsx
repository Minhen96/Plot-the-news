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
  const effectiveLabel = selectedId
    ? predictionOptions.find(o => o.id === selectedId)?.label ?? ''
    : customText

  async function handleLock() {
    if (!effectiveId) return

    const userAddress = 'demo-user'
    const timestamp = Date.now()
    const hash = hashPrediction(storyId, effectiveId, userAddress, timestamp)
    setTxHash(hash)

    setLockPhase('hashing')
    await delay(600)
    setLockPhase('submitting')

    // Fire-and-forget — don't block navigation on API response
    fetch('/api/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        storyId,
        optionId: effectiveId,
        optionLabel: effectiveLabel,
        userAddress,
        confidence,
        justification: effectiveId === 'custom' ? customText : undefined,
      }),
    }).catch(() => { /* ignore */ })

    await delay(600)
    setLockPhase('locked')

    // Save to sessionStorage for outcome page
    try {
      sessionStorage.setItem('game_prediction', JSON.stringify({
        storyId,
        roleId,
        optionId: effectiveId,
        optionLabel: effectiveLabel,
        confidence,
        customText: effectiveId === 'custom' ? customText : undefined,
        txHash: hash,
      }))
    } catch { /* ignore */ }

    await delay(800)
    router.push(`/story/${storyId}/outcome`)
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col">

      {/* Fixed background */}
      <div className="fixed inset-0 z-0">
        {backgroundUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={backgroundUrl} alt="" className="w-full h-full object-cover brightness-95" />
        ) : (
          <div className="w-full h-full bg-on-surface/80" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/60 to-transparent" />
      </div>

      {/* Header */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-8 py-4 bg-[#fefdf1]/80 backdrop-blur-md">
        <div className="text-2xl font-black text-primary italic font-headline tracking-tight">
          The Illuminated Editorial
        </div>
        <div className="hidden md:flex gap-8 items-center">
          <Link href="/" className="text-on-surface font-medium font-headline hover:text-primary transition-colors">Chronicle</Link>
          <Link href="/archive" className="text-on-surface font-medium font-headline hover:text-primary transition-colors">Archives</Link>
        </div>
      </nav>

      {/* Main */}
      <main className="flex-grow pt-24 pb-40 flex flex-col items-center relative overflow-hidden">
        <section className="relative z-10 w-full max-w-6xl px-6 mb-12">

          {/* Section header */}
          <div className="text-center mb-10">
            <span className="inline-block px-4 py-1 bg-primary-container text-on-primary-container rounded-full font-headline text-xs font-bold tracking-widest mb-4">
              COMMUNITY DIRECTIVES
            </span>
            <h2 className="font-headline text-4xl font-extrabold text-on-surface tracking-tight mb-2 uppercase">
              Strategic Consensus
            </h2>
            <p className="text-on-surface-variant font-medium">
              Real-time projections from the global intelligence network
            </p>
          </div>

          {/* Directive cards + author panel */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">

            {/* Directive cards (3 col) */}
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
              {predictionOptions.map((option) => {
                const isSelected = selectedId === option.id
                const isPopular = option.popular
                return (
                  <div
                    key={option.id}
                    className={`relative group p-6 rounded-xl bg-surface-container-lowest flex flex-col justify-between h-72 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-2 border-primary shadow-xl shadow-primary/10'
                        : isPopular
                        ? 'border-2 border-primary shadow-xl shadow-primary/5'
                        : 'border border-outline-variant/30 hover:border-secondary'
                    }`}
                    onClick={() => setSelectedId(isSelected ? null : option.id)}
                  >
                    {isPopular && (
                      <div className="absolute -top-3 left-4">
                        <span className="bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                          ↑ MOST POPULAR
                        </span>
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${isPopular ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'}`}>
                          {isPopular ? '🤝' : '🎯'}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold font-headline text-on-surface-variant uppercase tracking-tighter">
                            Proposed by {option.proposedBy}
                          </span>
                          {isPopular && (
                            <span className="text-[9px] font-bold text-primary">★ TRENDSETTER</span>
                          )}
                        </div>
                      </div>
                      <h3 className="font-headline font-bold text-xl text-on-surface mb-2 leading-tight">
                        {option.label}
                      </h3>
                      <p className="text-on-surface-variant text-sm leading-relaxed line-clamp-3 italic">
                        {option.description}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <span className={`text-xs font-bold font-headline ${isPopular ? 'text-primary' : 'text-on-surface-variant'}`}>
                        {option.votes.toLocaleString()} Votes
                      </span>
                      <button
                        className={`px-4 py-2 rounded-full text-xs font-bold font-headline transition-all hover:scale-105 ${
                          isSelected
                            ? 'bg-primary text-on-primary'
                            : isPopular
                            ? 'bg-primary text-on-primary'
                            : 'bg-surface-container text-on-surface hover:bg-secondary hover:text-white'
                        }`}
                        onClick={e => { e.stopPropagation(); setSelectedId(isSelected ? null : option.id) }}
                      >
                        {isSelected ? '✓ SELECTED' : 'SELECT'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Author directive panel */}
            <div className="bg-surface-container/60 backdrop-blur-xl border border-primary/20 rounded-xl p-6 h-full flex flex-col">
              <h4 className="font-headline font-extrabold text-sm text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                ✏ Author Directive
              </h4>
              <p className="text-xs text-on-surface-variant mb-4 leading-relaxed font-medium">
                Contribute your own strategic projection. High-performing directives earn <b>Trendsetter</b> status.
              </p>
              <textarea
                className="flex-grow w-full bg-white border border-outline-variant/30 rounded-lg p-3 text-sm font-body placeholder:text-on-surface-variant/40 focus:ring-1 focus:ring-primary focus:border-primary mb-4 resize-none"
                placeholder="Describe the outcome..."
                rows={5}
                value={customText}
                onChange={e => {
                  setCustomText(e.target.value)
                  if (e.target.value) setSelectedId(null)
                }}
              />
              <button
                className="w-full py-4 bg-primary text-on-primary rounded-full font-headline font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform disabled:opacity-40"
                disabled={!customText.trim()}
                onClick={() => customText.trim() && handleLock()}
              >
                SUBMIT TO NETWORK
              </button>
            </div>
          </div>

          {/* Confidence + Lock bar */}
          <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-8 p-6 bg-surface-container-low/80 backdrop-blur border border-outline-variant/10 rounded-full">
            <div className="flex-grow flex items-center gap-8 w-full md:w-auto px-4">
              <label className="font-headline font-bold text-[10px] text-on-surface-variant uppercase tracking-widest whitespace-nowrap">
                Confidence Level
              </label>
              <div className="relative flex-grow">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={confidence}
                  onChange={e => setConfidence(Number(e.target.value))}
                  className="w-full h-1.5 bg-outline-variant/30 rounded-full appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between mt-2 font-headline text-[9px] text-on-surface-variant/50 font-bold uppercase tracking-tighter">
                  <span>Cautious</span>
                  <span className="text-primary font-black">{confidence}%</span>
                  <span>Absolute</span>
                </div>
              </div>
            </div>

            {/* Lock button / animation */}
            {lockPhase === null ? (
              <button
                className="whitespace-nowrap px-10 py-4 bg-on-surface text-surface rounded-full font-headline font-extrabold tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-primary transition-colors disabled:opacity-40"
                disabled={!effectiveId}
                onClick={handleLock}
              >
                🔒 LOCK PREDICTION
              </button>
            ) : (
              <div className="whitespace-nowrap px-10 py-4 bg-on-surface text-surface rounded-full font-headline font-extrabold tracking-widest text-xs flex items-center justify-center gap-3 min-w-64">
                {lockPhase === 'hashing' && <>⚙ Hashing prediction... ▓▓▓░░░</>}
                {lockPhase === 'submitting' && <>📡 Submitting to L3... ▓▓▓▓▓░</>}
                {lockPhase === 'locked' && <>✅ Locked · {txHash.slice(0, 10)}...</>}
              </div>
            )}
          </div>
        </section>

        {/* Narrative anchor */}
        <div className="relative z-20 w-full max-w-5xl px-6 mt-auto">
          <div className="bg-surface-container-lowest/90 backdrop-blur border border-outline-variant/10 rounded-2xl p-8 flex flex-col md:flex-row gap-8 items-center shadow-[0_20px_50px_rgba(0,0,0,0.08)]">
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary-container shadow-lg">
                {characterPortrait ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={characterPortrait} alt={characterName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-primary/20" />
                )}
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary text-white font-headline text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter whitespace-nowrap">
                {characterName}
              </div>
            </div>
            <div className="flex-grow text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <span className="text-primary text-sm">⚠</span>
                <span className="font-headline font-bold text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
                  Strategic Briefing
                </span>
              </div>
              <p className="font-body text-xl md:text-2xl text-on-surface leading-snug italic">
                &ldquo;{cliffhanger}&rdquo;
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 w-full z-50 flex justify-around items-center px-6 pb-8 pt-4 bg-[#fefdf1]/90 backdrop-blur-xl shadow-[0_-8px_30px_rgb(53,58,38,0.06)] rounded-t-[2.5rem] md:hidden">
        {[
          { label: 'Continue', icon: '▶', active: true },
          { label: 'Log', icon: '📋', active: false },
          { label: 'Skip', icon: '⏩', active: false },
        ].map(({ label, icon, active }) => (
          <button key={label} className={`flex flex-col items-center justify-center p-3 rounded-full transition-all ${active ? 'bg-primary text-on-primary shadow-lg' : 'text-on-surface-variant/60'}`}>
            <span className="text-lg">{icon}</span>
            <span className="font-headline text-[9px] uppercase font-bold tracking-widest mt-1">{label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
