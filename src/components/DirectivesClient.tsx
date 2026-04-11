'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { usePrivy } from '@privy-io/react-auth'
import { hashPrediction, hashStory } from '@/lib/blockchain'
import { useRegisterPrediction } from '@/lib/wallet'
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
  const { user } = usePrivy()
  const registerOnChain = useRegisterPrediction()

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

  async function handleLock() {
    if (!effectiveId) return

    // Use real wallet address when authenticated, fall back to demo for dev
    const userAddress = user?.wallet?.address ?? 'demo-user'
    const timestamp = Date.now()
    const localHash = hashPrediction(storyId, effectiveId, userAddress, timestamp)
    setTxHash(localHash)

    setLockPhase('hashing')
    await delay(800)
    setLockPhase('submitting')

    // Save prediction to DB (fire-and-forget)
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

    // Attempt on-chain registration in the background — update txHash if it succeeds
    if (user?.wallet?.address) {
      const storyHashBytes = hashStory(storyId)
      registerOnChain({
        storyHash: storyHashBytes,
        predictionHash: localHash,
        confidence,
      })
        .then(({ txHash: confirmedHash }) => {
          setTxHash(confirmedHash)
          try {
            const stored = sessionStorage.getItem('game_prediction')
            if (stored) {
              const parsed = JSON.parse(stored)
              sessionStorage.setItem('game_prediction', JSON.stringify({ ...parsed, txHash: confirmedHash }))
            }
          } catch { /* ignore */ }
        })
        .catch(() => { /* wallet rejected or no contract — local hash stays */ })
    }

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
        txHash: localHash,
      }))
    } catch { /* ignore */ }

    await delay(800)
    setLockPhase('locked')
    await delay(1000)
    router.push(`/story/${storyId}/outcome`)
  }

  const officialOptions = predictionOptions.filter(o => !o.id.startsWith('community-'))
  const communityOptions = predictionOptions.filter(o => o.id.startsWith('community-'))

  return (
    <div className="bg-surface text-on-surface min-h-screen">

      {/* Nav — matches rest of app */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-8 py-4 bg-surface/90 backdrop-blur-md shadow-sm">
        <span className="text-xl font-black text-primary tracking-tighter font-headline">
          The Illuminated Editorial
        </span>
        <div className="hidden md:flex items-center gap-8 font-headline text-sm font-bold tracking-tight">
          <Link href="/" className="text-primary">Chronicle</Link>
          <Link href="/archive" className="text-on-surface/50 hover:text-primary transition-colors">Archive</Link>
          <Link href="/profile" className="text-on-surface/50 hover:text-primary transition-colors">Profile</Link>
        </div>
        <div className="w-6" />
      </nav>

      {/* ── ZONE 1: Cinematic hero ── */}
      <div className="relative h-[52vh] min-h-[340px] flex flex-col items-center justify-end">
        <div className="absolute inset-0">
          {backgroundUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={backgroundUrl}
              alt=""
              className="w-full h-full object-cover"
              style={{ filter: 'brightness(0.4) grayscale(15%)' }}
            />
          ) : (
            <div className="w-full h-full bg-on-surface" />
          )}
          {/* Seamless fade into cream zone */}
          <div className="absolute inset-0 bg-linear-to-b from-black/20 via-black/50 to-surface" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto pb-20">
          <span className="inline-block px-4 py-1 bg-primary/30 text-white border border-primary/50 rounded-full font-headline text-[10px] font-black tracking-[0.3em] mb-5 uppercase">
            Phase 03 — Strategic Directive
          </span>
          <h1 className="font-headline text-5xl md:text-6xl font-black text-white tracking-tighter uppercase italic leading-none mb-4">
            Deploy Your Consensus
          </h1>
          <p className="text-white/60 font-headline font-medium text-sm max-w-xl mx-auto">
            Select an established baseline or contribute a unique strategic projection to the network.
          </p>
        </div>
      </div>

      {/* ── ZONE 2: Cream content zone ── */}
      <div className="bg-surface relative z-10">
        <div className="max-w-6xl mx-auto px-6">

          {/* Narrative anchor — bridges the two zones */}
          <div className="-mt-12 mb-14 bg-surface-container-lowest border-l-8 border-primary rounded-2xl p-8 flex flex-col md:flex-row gap-8 items-center shadow-[0_20px_60px_rgba(53,58,38,0.12)]">
            <div className="shrink-0">
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-primary-container shadow-lg">
                {characterPortrait ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={characterPortrait} alt={characterName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-primary/20" />
                )}
              </div>
            </div>
            <div className="grow text-center md:text-left">
              <span className="font-headline font-black text-[10px] uppercase tracking-[0.35em] text-primary mb-2 block">
                Strategy Lead — {characterName}
              </span>
              <p className="font-body text-xl md:text-2xl text-on-surface leading-snug italic">
                &ldquo;{cliffhanger}&rdquo;
              </p>
            </div>
          </div>

          {/* Cards + Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start pb-16">

            <div className="lg:col-span-8 flex flex-col gap-10">
              {/* Official */}
              <div>
                <h3 className="font-headline text-[10px] font-black tracking-[0.4em] text-primary mb-6 flex items-center gap-3 uppercase">
                  <span className="w-6 h-px bg-primary/40" /> Baseline Projections
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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

              {/* Community */}
              {communityOptions.length > 0 && (
                <div>
                  <h3 className="font-headline text-[10px] font-black tracking-[0.4em] text-secondary mb-6 flex items-center gap-3 uppercase">
                    <span className="w-6 h-px bg-secondary/40" /> Community Insights
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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

            {/* Sidebar */}
            <div className="lg:col-span-4 sticky top-24">
              <div className="bg-surface-container rounded-2xl p-7 border border-outline-variant/20 shadow-sm">
                <h4 className="font-headline font-black text-xs text-primary uppercase tracking-[0.25em] mb-4 flex items-center gap-2">
                  <span className="p-1.5 bg-primary/10 rounded-lg text-sm">✎</span> Contribute Intelligence
                </h4>
                <p className="text-[13px] text-on-surface-variant mb-5 leading-relaxed">
                  Submit a custom outcome. Strategic AI will refine your input into a professional directive.
                </p>
                <textarea
                  className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-4 text-sm font-body text-on-surface placeholder:text-on-surface/30 focus:outline-none focus:ring-2 focus:ring-primary/40 mb-4 resize-none min-h-[140px] transition-all"
                  placeholder="Describe the geopolitical shift..."
                  value={customText}
                  onChange={e => {
                    setCustomText(e.target.value)
                    if (e.target.value) setSelectedId(null)
                  }}
                />
                <button
                  className="w-full py-3.5 bg-primary text-on-primary rounded-xl font-headline font-black text-[11px] uppercase tracking-[0.2em] shadow-md hover:brightness-110 active:scale-95 transition-all disabled:opacity-30"
                  disabled={!customText.trim() || lockPhase !== null}
                  onClick={() => customText.trim() && handleLock()}
                >
                  Syndicate to Network
                </button>
              </div>
            </div>
          </div>

          {/* HUD Bar */}
          <div className="pb-20">
            <div className="p-6 bg-surface-container rounded-2xl border border-outline-variant/20 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
              <div className="grow flex flex-col md:flex-row items-center gap-8 w-full md:w-auto px-2">
                <div className="flex flex-col gap-0.5 shrink-0">
                  <label className="font-headline font-black text-[9px] text-on-surface-variant uppercase tracking-widest">
                    Confidence Level
                  </label>
                  <span className="text-3xl font-black italic tracking-tighter text-on-surface">{confidence}%</span>
                </div>
                <div className="grow w-full flex flex-col gap-2">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={confidence}
                    onChange={e => setConfidence(Number(e.target.value))}
                    className="w-full h-1.5 bg-outline-variant/30 rounded-full appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between font-headline text-[9px] text-on-surface-variant/50 font-bold uppercase tracking-tighter">
                    <span>Cautious</span>
                    <span>Absolute</span>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-auto shrink-0">
                {lockPhase === null ? (
                  <button
                    className="w-full md:w-auto px-10 py-4 bg-on-surface text-surface rounded-xl font-headline font-black tracking-[0.25em] text-xs flex items-center justify-center gap-3 hover:bg-primary hover:text-on-primary transition-all disabled:opacity-20 shadow-lg"
                    disabled={!effectiveId}
                    onClick={handleLock}
                  >
                    🔒 Lock Prediction
                  </button>
                ) : (
                  <div className="w-full md:w-72 py-4 bg-primary-container border border-primary/30 text-on-primary-container rounded-xl font-headline font-black tracking-[0.15em] text-[10px] flex items-center justify-center gap-3">
                    {lockPhase === 'hashing' && <span className="animate-pulse">⚙ Hashing data...</span>}
                    {lockPhase === 'submitting' && <span className="animate-pulse">📡 Transmitting to chain...</span>}
                    {lockPhase === 'locked' && <>✅ {txHash.slice(0, 16).toUpperCase()}</>}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

function DirectiveCard({ option, isSelected, onSelect, isCommunity = false }: {
  option: Directive
  isSelected: boolean
  onSelect: () => void
  isCommunity?: boolean
}) {
  return (
    <div
      className={`relative group rounded-2xl flex flex-col justify-between cursor-pointer transition-all duration-200 overflow-hidden ${
        isSelected
          ? 'bg-primary-container border-l-4 border-primary shadow-[0_4px_24px_rgba(51,111,84,0.15)] ring-1 ring-primary/20'
          : 'bg-surface-container-lowest border-l-4 border-outline-variant/40 hover:border-primary/50 hover:shadow-md'
      }`}
      onClick={onSelect}
    >
      <div className="p-7">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 ${
            isCommunity ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'
          }`}>
            {isCommunity ? '👤' : '🏢'}
          </div>
          {isSelected && (
            <span className="bg-primary text-on-primary font-headline font-black text-[9px] px-2.5 py-1 rounded-full uppercase tracking-widest">
              ✓ Selected
            </span>
          )}
        </div>

        <h3 className="font-headline font-black text-lg text-on-surface mb-2 leading-tight tracking-tight uppercase">
          {option.label}
        </h3>
        <p className="text-on-surface/60 text-sm leading-relaxed">
          {option.description}
        </p>
      </div>

      <div className="px-7 pb-5 pt-4 flex items-center justify-between border-t border-outline-variant/10">
        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] font-black text-on-surface/30 uppercase tracking-widest">Proposed by</span>
          <span className="text-[11px] font-bold text-on-surface/60 truncate max-w-[130px]">
            {option.proposedBy === 'system' ? 'Strategic AI' : option.proposedBy}
          </span>
        </div>
        <span className={`text-[10px] font-headline font-black uppercase tracking-widest transition-colors ${
          isSelected ? 'text-primary' : 'text-on-surface/30 group-hover:text-primary/60'
        }`}>
          {isSelected ? '✓ Chosen' : 'Select →'}
        </span>
      </div>
    </div>
  )
}
