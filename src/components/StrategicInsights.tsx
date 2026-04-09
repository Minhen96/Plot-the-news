import React from 'react'

export interface InsightProps {
  tendencyLabel: string;
  tendencyScore: number; // 0-100 indicating consensus strength
  highlights: string[];
}

export default function StrategicInsights({ insight }: { insight: InsightProps }) {
  return (
    <div className="bg-surface-container border border-outline-variant/20 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <h3 className="font-headline font-black uppercase text-sm tracking-widest text-on-background">
          AI Strategic Consensus
        </h3>
        <div className="flex-1 h-px bg-outline-variant/30" />
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Score Area */}
        <div className="flex flex-col items-center justify-center shrink-0 w-full md:w-32 md:border-r border-outline-variant/20 pr-0 md:pr-6 pb-6 md:pb-0 border-b md:border-b-0">
          <div className="text-4xl font-headline font-extrabold text-primary mb-1">
            {insight.tendencyScore}%
          </div>
          <div className="font-label text-[10px] uppercase tracking-widest text-on-surface/60 text-center">
            {insight.tendencyLabel}
          </div>
        </div>

        {/* Highlights List */}
        <div className="flex-1 w-full">
          <p className="font-body text-sm text-on-surface/70 italic mb-4">
            Analysis of real-time community directives reveals the following rationale patterns:
          </p>
          <ul className="space-y-4">
            {insight.highlights.map((highlight, idx) => (
              <li key={idx} className="flex gap-3 items-start">
                <span className="text-tertiary mt-0.5 text-xs">◆</span>
                <span className="font-body text-sm leading-relaxed text-on-surface">{highlight}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
