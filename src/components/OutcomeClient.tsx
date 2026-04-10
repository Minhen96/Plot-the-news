'use client'

/**
 * OutcomeClient.tsx
 *
 * Full outcome experience after a prediction is locked.
 * Phases: loading → short-term → mid-term → long-term → summary
 *
 * - Loading: animated progress bar, intelligence briefing carousel,
 *   fires POST /api/stories/simulate in background (min 3s display time).
 * - Phase screens: full-bleed cinematic background, Fleet Command sidebar,
 *   Intel Analysis panel, character portrait + speech bubble.
 * - Summary: on-chain proof, timeline recap, navigation CTAs.
 */

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import type { SimulationPhase, HistoricalEvidence } from '@/lib/types'

interface Props {
  storyId: string
  storyTitle: string
  panelBackgrounds: string[]  // one per panel; phases map to index 0/1/2
  characterPortrait: string
  characterName: string
  historicalContext: string
  historicalEvidence?: HistoricalEvidence
  cliffhanger?: string
}

type PhaseKey = 'loading' | 'short' | 'mid' | 'long' | 'summary'

interface StoredPrediction {
  storyId: string
  roleId?: string
  optionId: string
  optionLabel: string
  confidence: number
  txHash?: string
}

const FALLBACK_TIMELINE: SimulationPhase[] = [
  {
    phase: 'short', label: 'Short-term', timeframe: 'Days 1-7', emoji: '🟡',
    probability: 72, operationalStatus: 'Initial Response',
    causalFactors: ['Strategic execution', 'Allied response'],
    event: 'The immediate consequences of this strategic decision begin to ripple through the theatre of operations. Initial indicators suggest the choice is reshaping the balance of power in the region.',
  },
  {
    phase: 'mid', label: 'Mid-term', timeframe: 'Weeks 1-12', emoji: '🟠',
    probability: 58, operationalStatus: 'Developing Situation',
    causalFactors: ['Diplomatic realignment', 'Economic adjustment'],
    event: 'Regional actors respond to the strategic shift, recalibrating their positions across diplomatic and economic channels. The second-order effects are becoming increasingly visible.',
  },
  {
    phase: 'long', label: 'Long-term', timeframe: 'Year 1-3', emoji: '🔴',
    probability: 44, operationalStatus: 'New Equilibrium',
    causalFactors: ['Structural transformation', 'Precedent establishment'],
    event: 'The structural transformation of the geopolitical landscape is now evident. This decision will serve as a precedent — reshaping alliance structures and deterrence doctrines for a generation.',
  },
]

export default function OutcomeClient({
  storyId,
  storyTitle,
  panelBackgrounds,
  characterPortrait,
  characterName,
  historicalContext,
  historicalEvidence,
}: Props) {
  const PHASE_BG: Record<'short' | 'mid' | 'long', string> = {
    short: panelBackgrounds[0] ?? '',
    mid:   panelBackgrounds[1] ?? panelBackgrounds[0] ?? '',
    long:  panelBackgrounds[2] ?? panelBackgrounds[1] ?? panelBackgrounds[0] ?? '',
  }
  const [phase, setPhase] = useState<PhaseKey>('loading')
  const [timeline, setTimeline] = useState<SimulationPhase[]>([])
  const [progress, setProgress] = useState(0)
  const [briefingIndex, setBriefingIndex] = useState(0)
  const [prediction, setPrediction] = useState<StoredPrediction | null>(null)
  const fetchStarted = useRef(false)

  const briefingCards = [
    historicalEvidence && {
      icon: '📜',
      category: 'Historical Precedent',
      headline: historicalEvidence.title,
      fact: historicalEvidence.quote,
    },
    historicalContext && {
      icon: '🌍',
      category: 'Strategic Context',
      headline: 'The Critical Variable',
      fact: historicalContext,
    },
    {
      icon: '⚡',
      category: 'FutureLens Engine',
      headline: 'AI Simulation Active',
      fact: 'The FutureLens model analyses decision pathways across three temporal horizons, drawing from historical precedent and real-time geopolitical intelligence.',
    },
  ].filter(Boolean) as { icon: string; category: string; headline: string; fact: string }[]

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('game_prediction')
      if (stored) setPrediction(JSON.parse(stored))
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    if (fetchStarted.current) return

    const run = (pred: StoredPrediction | null) => {
      fetchStarted.current = true

      const payload = pred ?? {
        storyId,
        optionId: 'de-escalation',
        optionLabel: 'Strategic De-escalation',
        roleId: 'analyst',
        confidence: 75,
      }

      // Animate progress 0 → 95% over 4 seconds
      const startTime = Date.now()
      const progressInterval = setInterval(() => {
        const p = Math.min(95, ((Date.now() - startTime) / 4000) * 95)
        setProgress(p)
        if (p >= 95) clearInterval(progressInterval)
      }, 50)

      Promise.all([
        fetch('/api/stories/simulate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            storyId: payload.storyId,
            optionId: payload.optionId,
            optionLabel: payload.optionLabel,
            roleId: payload.roleId,
            isCustom: payload.optionId === 'custom',
          }),
        })
          .then(r => r.ok ? r.json() : Promise.reject())
          .catch(() => ({ timeline: FALLBACK_TIMELINE })),
        new Promise<void>(resolve => setTimeout(resolve, 3000)),
      ]).then(([data]) => {
        clearInterval(progressInterval)
        setProgress(100)
        setTimeline(data?.timeline?.length ? data.timeline : FALLBACK_TIMELINE)
        setTimeout(() => setPhase('short'), 500)
      }).catch(() => {
        clearInterval(progressInterval)
        setProgress(100)
        setTimeline(FALLBACK_TIMELINE)
        setTimeout(() => setPhase('short'), 500)
      })
    }

    if (prediction) {
      run(prediction)
    } else {
      const t = setTimeout(() => run(null), 500)
      return () => clearTimeout(t)
    }
  }, [prediction, storyId])

  function advance() {
    if (phase === 'short') setPhase('mid')
    else if (phase === 'mid') setPhase('long')
    else if (phase === 'long') setPhase('summary')
  }

  const currentPhaseData =
    timeline.find(p => p.phase === (phase as 'short' | 'mid' | 'long')) ??
    FALLBACK_TIMELINE.find(p => p.phase === (phase as 'short' | 'mid' | 'long'))!

  if (phase === 'loading') {
    return (
      <LoadingScreen
        progress={progress}
        briefingCards={briefingCards}
        briefingIndex={briefingIndex}
        onBriefingChange={setBriefingIndex}
      />
    )
  }

  if (phase === 'summary') {
    return (
      <SummaryScreen
        storyId={storyId}
        storyTitle={storyTitle}
        timeline={timeline}
        prediction={prediction}
      />
    )
  }

  return (
    <PhaseScreen
      phase={phase as 'short' | 'mid' | 'long'}
      phaseData={currentPhaseData}
      backgroundUrl={PHASE_BG[phase as 'short' | 'mid' | 'long']}
      characterPortrait={characterPortrait}
      characterName={characterName}
      onContinue={advance}
    />
  )
}

// ─────────────────────────────────────────────────────────────
// Loading Screen
// ─────────────────────────────────────────────────────────────

interface LoadingScreenProps {
  progress: number
  briefingCards: { icon: string; category: string; headline: string; fact: string }[]
  briefingIndex: number
  onBriefingChange: (i: number) => void
}

function LoadingScreen({ progress, briefingCards, briefingIndex, onBriefingChange }: LoadingScreenProps) {
  const card = briefingCards[briefingIndex] ?? briefingCards[0]

  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface">
      <header className="fixed top-0 w-full z-50 bg-[#fefdf1]/80 backdrop-blur-xl flex justify-between items-center px-6 h-16">
        <div className="text-2xl font-black text-primary italic font-headline tracking-tight">FutureLens</div>
        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="font-headline text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors">Chronicle</Link>
          <Link href="/archive" className="font-headline text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors">Archive</Link>
        </div>
      </header>

      <main className="w-full max-w-4xl mx-auto px-6 pt-28 pb-32 flex flex-col items-center text-center gap-12">

        {/* Title + progress */}
        <section className="flex flex-col items-center gap-6 w-full">
          <h1 className="font-headline text-4xl md:text-5xl font-extrabold text-on-surface tracking-tighter leading-tight">
            Generating Future
            <br />
            <span className="text-primary italic font-body font-medium">Simulation...</span>
          </h1>

          <div className="w-full max-w-lg space-y-3">
            <div className="flex justify-between items-end px-1">
              <span className="font-label text-xs uppercase tracking-[0.2em] text-outline font-bold">
                Synthesizing Variables
              </span>
              <span className="font-headline font-black text-xl text-primary">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full h-3 bg-surface-container-high rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full transition-all duration-300 relative overflow-hidden"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.25)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.25)_50%,rgba(255,255,255,0.25)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-pulse" />
              </div>
            </div>
          </div>
        </section>

        {/* Briefing carousel */}
        <section className="w-full relative">
          <h3 className="font-headline font-bold text-[10px] uppercase tracking-[0.3em] text-outline mb-8">
            Intelligence Briefing
          </h3>
          <div className="relative flex items-center justify-center">
            <button
              onClick={() => onBriefingChange((briefingIndex - 1 + briefingCards.length) % briefingCards.length)}
              className="absolute -left-4 md:-left-12 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-high text-primary transition-colors shadow-sm text-2xl font-bold"
              aria-label="Previous"
            >
              ‹
            </button>

            <div className="w-full max-w-2xl bg-surface-container-low rounded-xl p-8 md:p-12 border border-outline-variant/10 shadow-lg text-left transition-all hover:-translate-y-1">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-xl">
                  {card.icon}
                </div>
                <span className="font-label text-xs font-bold uppercase tracking-widest text-primary">
                  {card.category}
                </span>
              </div>
              <h4 className="font-headline font-extrabold text-2xl text-on-surface mb-4">
                {card.headline}
              </h4>
              <p className="font-body text-xl text-on-surface-variant leading-relaxed">
                {card.fact}
              </p>
              <div className="mt-8 flex gap-2">
                {briefingCards.map((_, i) => (
                  <div
                    key={i}
                    onClick={() => onBriefingChange(i)}
                    className={`h-1 rounded-full transition-all cursor-pointer ${i === briefingIndex ? 'w-8 bg-primary' : 'w-4 bg-outline-variant'}`}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={() => onBriefingChange((briefingIndex + 1) % briefingCards.length)}
              className="absolute -right-4 md:-right-12 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-high text-primary transition-colors shadow-sm text-2xl font-bold"
              aria-label="Next"
            >
              ›
            </button>
          </div>
        </section>

        {/* Status line */}
        <div className="flex items-center gap-2 text-outline font-label text-[10px] uppercase tracking-[0.2em]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
          Neural Engine: Active Global Node
        </div>
      </main>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Phase Screen (short / mid / long)
// ─────────────────────────────────────────────────────────────

interface PhaseScreenProps {
  phase: 'short' | 'mid' | 'long'
  phaseData: SimulationPhase
  backgroundUrl: string
  characterPortrait: string
  characterName: string
  onContinue: () => void
}

const PHASE_BADGE: Record<'short' | 'mid' | 'long', string> = {
  short: 'CURRENT PHASE: SHORT-TERM OUTCOME (DAYS 1–7)',
  mid: 'CURRENT PHASE: MID-TERM OUTCOME (WEEKS 1–12)',
  long: 'CURRENT PHASE: LONG-TERM OUTCOME (YEAR 1–3)',
}

const NEXT_LABEL: Record<'short' | 'mid' | 'long', string> = {
  short: 'Mid-term →',
  mid: 'Long-term →',
  long: 'View Results →',
}

function PhaseScreen({
  phase,
  phaseData,
  backgroundUrl,
  characterPortrait,
  characterName,
  onContinue,
}: PhaseScreenProps) {
  const probability = phaseData.probability ?? (phase === 'short' ? 74 : phase === 'mid' ? 61 : 45)
  const operationalStatus = phaseData.operationalStatus ?? (phase === 'short' ? 'Initial Response' : phase === 'mid' ? 'Developing Situation' : 'New Equilibrium')
  const causalFactors = phaseData.causalFactors ?? ['Strategic alignment', 'Regional dynamics']

  return (
    <div className="bg-surface text-on-surface overflow-hidden h-screen w-screen flex flex-col">

      {/* Top nav */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-[#fefdf1]/80 backdrop-blur-xl">
        <div className="flex items-center gap-8">
          <h1 className="text-2xl font-black italic text-primary font-headline">The Illuminated Editorial</h1>
          <nav className="hidden md:flex gap-6">
            <span className="font-headline uppercase tracking-widest text-[11px] font-bold text-secondary border-b-2 border-secondary pb-1 cursor-default">
              Narrative
            </span>
            <span className="font-headline uppercase tracking-widest text-[11px] font-bold text-on-surface/50 cursor-default">Map</span>
            <span className="font-headline uppercase tracking-widest text-[11px] font-bold text-on-surface/50 cursor-default">Timeline</span>
          </nav>
        </div>
      </header>

      {/* Left sidebar — desktop only */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 z-40 flex-col w-64 p-6 pt-24 space-y-8 bg-surface-container-low shadow-[32px_0_64px_-20px_rgba(53,58,38,0.06)]">
        <div>
          <h2 className="text-xl font-bold text-primary font-headline">Fleet Command</h2>
          <p className="text-xs text-on-surface-variant font-label">FutureLens Simulator</p>
        </div>
        <nav className="flex flex-col gap-1">
          {[
            { icon: '📊', label: 'Intel', active: true },
            { icon: '🤝', label: 'Diplomacy', active: false },
            { icon: '⚖️', label: 'War Room', active: false },
            { icon: '📚', label: 'Archive', active: false },
          ].map(({ icon, label, active }) => (
            <div
              key={label}
              className={`flex items-center gap-3 p-3 rounded-xl font-label font-medium text-sm transition-colors cursor-default ${
                active
                  ? 'text-primary font-bold bg-surface-container'
                  : 'text-on-surface/50'
              }`}
            >
              <span>{icon}</span>
              {label}
            </div>
          ))}
        </nav>
        <button
          onClick={onContinue}
          className="mt-auto w-full py-4 rounded-full bg-primary text-on-primary font-label font-bold tracking-widest uppercase text-xs hover:bg-primary-dim transition-colors active:scale-[0.98]"
        >
          {NEXT_LABEL[phase]}
        </button>
      </aside>

      {/* Main cinematic canvas */}
      <main className="relative flex-grow w-full h-full pt-20 flex flex-col items-center justify-end overflow-hidden">

        {/* Background image */}
        <div className="absolute inset-0 z-0">
          {backgroundUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={backgroundUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-on-surface/80" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-90" />
        </div>

        {/* Intel Analysis — right sidebar, desktop */}
        <div className="absolute right-8 top-28 z-20 w-72 space-y-4 hidden lg:block">
          <div className="bg-surface-container-lowest/80 backdrop-blur-md p-5 rounded-lg shadow-sm border border-outline-variant/15">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-secondary text-sm">📊</span>
              <h3 className="font-headline text-xs font-bold uppercase tracking-wider text-on-surface">Intel Analysis</h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-label font-bold text-on-surface-variant uppercase mb-1">
                  Probability Assessment
                </p>
                <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full transition-all duration-700" style={{ width: `${probability}%` }} />
                </div>
                <p className="text-right text-[10px] font-label font-bold text-primary mt-1">{probability}% Confidence</p>
              </div>
              <div>
                <p className="text-[10px] font-label font-bold text-on-surface-variant uppercase mb-1">Causal Factors</p>
                <ul className="text-xs font-label space-y-2 text-on-surface">
                  {causalFactors.map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-tertiary mt-1 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-low/90 backdrop-blur-md p-4 rounded-lg border-l-4 border-secondary shadow-sm">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-label font-bold text-secondary uppercase">Operational Status</span>
              <span className="text-[10px] font-label font-medium bg-secondary/10 text-secondary px-2 py-0.5 rounded-full">
                {operationalStatus}
              </span>
            </div>
            <p className="text-xs font-label text-on-surface">{phaseData.timeframe}</p>
          </div>
        </div>

        {/* Character portrait + dialogue box */}
        <div className="relative z-30 w-full max-w-5xl px-6 pb-20 lg:pb-10 lg:pl-72">

          {/* Portrait — floating above dialogue card */}
          <div className="absolute -top-28 left-12 lg:left-[17rem] w-40 h-40 pointer-events-none">
            {characterPortrait ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={characterPortrait}
                alt={characterName}
                className="w-full h-full object-cover rounded-2xl drop-shadow-2xl"
              />
            ) : (
              <div className="w-full h-full bg-primary/20 rounded-2xl" />
            )}
          </div>

          {/* Dialogue card */}
          <div className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_32px_64px_-20px_rgba(53,58,38,0.06)] relative border border-outline-variant/15">
            {/* Speech bubble tail */}
            <div className="absolute left-20 -top-4 w-8 h-8 bg-surface-container-lowest rotate-45 border-l border-t border-outline-variant/15" />

            <div className="flex flex-col gap-2">
              <h4 className="font-headline text-sm font-bold text-primary flex items-center gap-2">
                <span className="text-xs">✓</span>
                {characterName.toUpperCase()}
              </h4>
              <p className="font-body text-xl md:text-2xl leading-relaxed text-on-surface">
                &ldquo;{phaseData.event}&rdquo;
              </p>
            </div>

            <div className="mt-6 flex items-center justify-between gap-4">
              <span className="font-headline text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                {phaseData.emoji} {phaseData.label} — {phaseData.timeframe}
              </span>
              <button
                onClick={onContinue}
                className="group flex items-center gap-2 bg-primary text-on-primary px-8 py-4 rounded-full font-label font-bold text-sm hover:bg-primary-dim transition-all shadow-lg active:scale-95 whitespace-nowrap"
              >
                CLICK TO CONTINUE
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-8 py-4 bg-[#fefdf1]/90 backdrop-blur-2xl rounded-t-[3rem] shadow-[0_-8px_32px_rgba(53,58,38,0.04)]">
        <button className="flex flex-col items-center text-secondary">
          <span className="font-headline text-[10px] font-semibold uppercase tracking-widest">Narrative</span>
        </button>
        <button className="flex flex-col items-center text-on-surface/40">
          <span className="font-headline text-[10px] font-semibold uppercase tracking-widest">Timeline</span>
        </button>
        <button onClick={onContinue} className="flex flex-col items-center text-primary font-bold">
          <span className="font-headline text-[10px] font-semibold uppercase tracking-widest">Next →</span>
        </button>
      </nav>

      {/* Phase badge — floating, centered */}
      <div className="fixed top-[4.5rem] left-1/2 -translate-x-1/2 z-40 bg-tertiary-container/20 backdrop-blur-sm border border-tertiary/20 px-5 py-1.5 rounded-full whitespace-nowrap">
        <p className="font-label text-[11px] font-bold text-tertiary flex items-center gap-2">
          <span>🕐</span>
          {PHASE_BADGE[phase]}
        </p>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Summary Screen
// ─────────────────────────────────────────────────────────────

interface SummaryScreenProps {
  storyId: string
  storyTitle: string
  timeline: SimulationPhase[]
  prediction: StoredPrediction | null
}

function SummaryScreen({ storyId, storyTitle, timeline, prediction }: SummaryScreenProps) {
  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col">
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-[#fefdf1]/80 backdrop-blur-xl">
        <h1 className="text-2xl font-black italic text-primary font-headline">The Illuminated Editorial</h1>
        <nav className="hidden md:flex gap-6">
          <Link href="/" className="font-headline text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors">Chronicle</Link>
          <Link href="/archive" className="font-headline text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors">Archive</Link>
        </nav>
      </header>

      <main className="flex-grow pt-28 pb-40 px-6 max-w-4xl mx-auto w-full space-y-6">

        {/* Completion badge */}
        <div className="text-center space-y-3">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-container text-on-primary-container rounded-full font-headline text-xs font-bold uppercase tracking-widest">
            ✅ Simulation Complete
          </span>
          <h2 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight">{storyTitle}</h2>
        </div>

        {/* On-chain proof */}
        {prediction?.txHash && (
          <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">⛓️</span>
              <div>
                <h3 className="font-headline font-bold text-sm text-on-surface uppercase tracking-wide">On-Chain Verified</h3>
                <p className="text-xs text-on-surface-variant font-label">DCAI L3 Testnet · Chain ID 18441</p>
              </div>
            </div>
            <div className="bg-surface-container rounded-lg p-3 font-mono text-xs text-on-surface-variant break-all leading-relaxed">
              {prediction.txHash}
            </div>
            <p className="text-xs font-label text-on-surface-variant mt-3 flex items-center gap-1">
              <span className="text-primary text-xs">●</span>
              Prediction registered permanently on the DCAI L3 blockchain
            </p>
          </div>
        )}

        {/* Your prediction */}
        {prediction && (
          <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-6">
            <h3 className="font-headline font-bold text-sm text-on-surface uppercase tracking-wide mb-3">Your Prediction</h3>
            <div className="flex items-center gap-4">
              <div className="flex-grow">
                <p className="font-body text-xl italic text-on-surface">&ldquo;{prediction.optionLabel}&rdquo;</p>
                <p className="text-xs font-label text-on-surface-variant mt-1">
                  Confidence:{' '}
                  <span className="text-primary font-bold">{prediction.confidence}%</span>
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-3xl font-black font-headline text-primary">+2</div>
                <div className="text-xs font-label text-on-surface-variant uppercase tracking-wide">pts earned</div>
              </div>
            </div>
          </div>
        )}

        {/* Simulation timeline */}
        <div className="space-y-3">
          <h3 className="font-headline font-bold text-sm text-on-surface uppercase tracking-wide">Simulation Timeline</h3>
          {timeline.map((p) => (
            <div key={p.phase} className="bg-surface-container-lowest border border-outline-variant/15 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{p.emoji}</span>
                <div className="flex-grow">
                  <span className="font-headline font-bold text-sm text-on-surface">{p.label}</span>
                  <span className="ml-2 font-label text-xs text-on-surface-variant">{p.timeframe}</span>
                </div>
                {p.operationalStatus && (
                  <span className="font-label text-[10px] font-bold bg-secondary/10 text-secondary px-2 py-0.5 rounded-full whitespace-nowrap">
                    {p.operationalStatus}
                  </span>
                )}
              </div>
              <p className="font-body text-base text-on-surface-variant leading-relaxed">{p.event}</p>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 pt-2">
          <Link
            href="/"
            className="flex-1 py-4 rounded-full bg-primary text-on-primary font-headline font-bold text-sm text-center uppercase tracking-widest hover:bg-primary-dim transition-colors shadow-lg"
          >
            Explore Next Story
          </Link>
          <Link
            href={`/story/${storyId}`}
            className="flex-1 py-4 rounded-full bg-surface-container text-on-surface font-headline font-bold text-sm text-center uppercase tracking-widest hover:bg-surface-container-high transition-colors"
          >
            Read Article
          </Link>
        </div>
      </main>

      {/* Mobile nav */}
      <nav className="fixed bottom-0 w-full z-50 flex justify-around items-center px-6 pb-8 pt-4 bg-[#fefdf1]/90 backdrop-blur-xl shadow-[0_-8px_30px_rgb(53,58,38,0.06)] rounded-t-[2.5rem] md:hidden">
        {[
          { label: 'Chronicle', href: '/' },
          { label: 'Archive', href: '/archive' },
        ].map(({ label, href }) => (
          <Link key={label} href={href} className="flex flex-col items-center justify-center p-3 text-on-surface-variant/60">
            <span className="font-headline text-[9px] uppercase font-bold tracking-widest">{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
