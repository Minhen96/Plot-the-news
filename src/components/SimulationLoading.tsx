'use client'

import { useState, useEffect } from 'react'

const STATUSES = [
  "Initializing neural models...",
  "Contacting continuous Sentinel nodes...",
  "Analyzing faction postures...",
  "Evaluating geopolitical outcomes...",
  "Synthesizing scenario parameters...",
  "Running Monte Carlo probability vectors...",
  "Simulating macro-economic shifts...",
  "Parsing global tension metrics...",
  "Cross-referencing historical precedents...",
  "Evaluating diplomatic back-channels...",
  "Calculating strategic disruption indexes...",
  "Predicting stability fallout...",
  "Compiling neural consensus...",
  "Generating multi-agent timeline..."
]

const BRIEFS = [
  { 
    topic: "Strategic Chokepoint", 
    title: "The Strait of Hormuz", 
    body: "Approximately 20% of the world's oil consumption passes through this narrow waterway daily. Any naval escalation directly impacts global energy stability.", 
    icon: "directions_boat" 
  },
  { 
    topic: "Market Volatility", 
    title: "Global Supply Lines", 
    body: "Disruptions in primary arterial shipping lanes statistically lead to immediate crude index inflation within 48 hours of provocation.", 
    icon: "trending_down" 
  },
  { 
    topic: "Naval Posture", 
    title: "Asymmetric Doctrine", 
    body: "The Regional Guard historically employs fast-attack swarm tactics to effectively leverage asymmetric deterrence against larger carrier groups.", 
    icon: "speed" 
  },
]

export default function SimulationLoading() {
  const [statusIndex, setStatusIndex] = useState(0)
  const [briefIndex, setBriefIndex] = useState(0)

  useEffect(() => {
    // Cycle status every 2.5 seconds
    const statusInterval = setInterval(() => {
      setStatusIndex(i => (i + 1) % STATUSES.length)
    }, 2500)

    // Cycle brief every 5 seconds
    const briefInterval = setInterval(() => {
      setBriefIndex(i => (i + 1) % BRIEFS.length)
    }, 5000)

    return () => {
      clearInterval(statusInterval)
      clearInterval(briefInterval)
    }
  }, [])

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center px-4 py-24 bg-background relative selection:bg-primary-container selection:text-on-primary-container z-10 animate-in fade-in duration-700">
      <div className="w-full max-w-4xl flex flex-col items-center text-center gap-12">
        
        {/* Header Block */}
        <div className="flex flex-col items-center gap-6 w-full">
          <h1 className="font-headline text-4xl md:text-5xl font-extrabold text-on-background tracking-tighter leading-tight drop-shadow-sm">
            Generating Future <br/><span className="text-primary italic font-body font-medium">Simulation...</span>
          </h1>

          {/* AI Thinking Status Bar */}
          <div className="w-full max-w-lg space-y-3 pt-4">
            <div className="flex justify-start px-1">
              <span className="font-label text-xs uppercase tracking-[0.2em] text-outline font-bold animate-pulse">
                {STATUSES[statusIndex]}
              </span>
            </div>
            
            {/* Indeterminate Sweeping Bar */}
            <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden shadow-inner relative">
              <div className="absolute inset-0 w-full bg-primary rounded-full progress-stripe opacity-80" />
            </div>
          </div>
        </div>

        {/* Central Intelligence Briefing Carousel */}
        <div className="w-full relative group pt-6 min-h-[260px]">
          <h3 className="font-headline font-bold text-[10px] uppercase tracking-[0.3em] text-outline mb-6">
            Intelligence Briefing Dashboard
          </h3>
          <div className="relative flex items-center justify-center">
            
            <div 
              key={briefIndex} 
              className="w-full max-w-2xl bg-surface-container-low rounded-xl p-8 md:p-10 border border-outline-variant/20 shadow-lg text-left animate-in fade-in slide-in-from-bottom-2 duration-500"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
                  <span className="material-symbols-outlined text-[20px] font-normal">{BRIEFS[briefIndex].icon}</span>
                </div>
                <span className="font-label text-xs font-bold uppercase tracking-widest text-primary">
                  {BRIEFS[briefIndex].topic}
                </span>
              </div>
              
              <h4 className="font-headline font-extrabold text-xl text-on-background mb-3">
                {BRIEFS[briefIndex].title}
              </h4>
              <p className="font-body text-lg text-on-surface-variant leading-relaxed">
                {BRIEFS[briefIndex].body}
              </p>
              
              {/* Carousel Indicators */}
              <div className="mt-8 flex gap-2">
                {BRIEFS.map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1 transition-all duration-300 rounded-full ${i === briefIndex ? "w-8 bg-primary" : "w-4 bg-outline-variant/50"}`} 
                  />
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* System Status Label (Pulsing) */}
        <div className="flex items-center gap-3 text-outline font-label text-[10px] uppercase tracking-[0.2em] mt-8 opacity-80">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          Neural Engine: Active Middle East Node
        </div>
        
      </div>
    </div>
  )
}
