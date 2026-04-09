import React from 'react'
import Header from '@/components/Header'
import StrategicInsights, { InsightProps } from '@/components/StrategicInsights'

const mockInsight: InsightProps = {
  tendencyLabel: "Cautious Alignment",
  tendencyScore: 74,
  highlights: [
    "A majority of users are prioritizing economic stability over military assertion, citing fears of a global energy crisis.",
    "The Coalition players are largely favoring backchannel diplomacy rather than direct kinetic engagement.",
    "A vocal minority are predicting unpredictable market interventions by neutral state actors."
  ]
}

export default function PredictPage() {
  return (
    <div className="min-h-screen bg-surface">
      <Header brand="editorial" />
      <main className="max-w-4xl mx-auto px-6 pt-12 pb-24">
        <h1 className="font-headline text-4xl font-extrabold mb-8 text-on-surface">
          Community Directives
        </h1>
        {/* Placeholder for future directive cards */}
        <div className="h-64 bg-surface-container-low border border-outline-variant/20 rounded-xl mb-12 flex items-center justify-center">
          <span className="font-label text-xs uppercase tracking-widest text-on-surface/40">
            [ Directive Selection Area ]
          </span>
        </div>

        <StrategicInsights insight={mockInsight} />
      </main>
    </div>
  )
}
