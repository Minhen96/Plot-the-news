'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Role } from '@/lib/types'

const FACTION_STYLES = [
  {
    accent:      'text-primary',
    badge:       'bg-primary text-on-primary',
    bar:         'bg-primary shadow-[0_0_8px_rgba(51,111,84,0.4)]',
    quote:       'bg-surface-container-low',
    quoteIcon:   'text-primary bg-primary-container',
    focus:       'Stability Focus',
    statKey:     'stability' as const,
    ring:        'ring-primary',
  },
  {
    accent:      'text-tertiary',
    badge:       'bg-tertiary text-on-tertiary',
    bar:         'bg-tertiary shadow-[0_0_8px_rgba(145,87,0,0.4)]',
    quote:       'bg-surface-container-low',
    quoteIcon:   'text-tertiary bg-tertiary-container',
    focus:       'Disruption Focus',
    statKey:     'strategic' as const,
    ring:        'ring-tertiary',
  },
]

interface Props {
  storyId: string
  roles: Role[]
}

export default function RoleSelector({ storyId, roles }: Props) {
  const router = useRouter()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  function handleSelect(roleId: string) {
    setSelectedId(roleId)
  }

  function handleStart() {
    if (!selectedId) return
    sessionStorage.setItem('prediction', JSON.stringify({ storyId, roleId: selectedId }))
    router.push(`/story/${storyId}/play`)
  }

  return (
    <div>
      {/* Role cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
        {roles.map((role, i) => {
          const style     = FACTION_STYLES[i] ?? FACTION_STYLES[0]
          const statValue = role.stats[style.statKey]
          const isSelected = selectedId === role.id

          return (
            <button
              key={role.id}
              onClick={() => handleSelect(role.id)}
              className={`group relative bg-surface-container rounded-2xl p-1 transition-all text-left w-full hover:shadow-[0_32px_64px_-15px_rgba(53,58,38,0.12)] ${
                isSelected ? `ring-2 ${style.ring} shadow-[0_32px_64px_-15px_rgba(53,58,38,0.16)]` : ''
              }`}
            >
              <div className="bg-surface-container-lowest rounded-[1.85rem] h-full overflow-hidden flex flex-col">
                {/* Portrait */}
                <div className="relative h-96 overflow-hidden">
                  {role.portraitUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={role.portraitUrl}
                      alt={role.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className={`w-full h-full bg-linear-to-br ${
                      i === 0
                        ? 'from-primary/30 via-surface-container to-primary-container/40'
                        : 'from-tertiary/30 via-surface-container to-tertiary-container/40'
                    } transition-transform duration-700 group-hover:scale-105`} />
                  )}
                  <div className="absolute inset-0 bg-linear-to-t from-surface-container-lowest via-transparent to-transparent" />
                  <span className={`absolute top-6 left-6 ${style.badge} px-4 py-1 rounded-full font-headline text-[10px] font-bold uppercase tracking-widest`}>
                    {role.faction}
                  </span>
                  {isSelected && (
                    <span className="absolute top-6 right-6 bg-surface-container-lowest/90 text-on-surface px-3 py-1 rounded-full font-label text-[10px] font-black uppercase tracking-widest">
                      ✓ Selected
                    </span>
                  )}
                </div>

                {/* Body */}
                <div className="p-10 flex-1 flex flex-col">
                  <h2 className={`font-headline text-3xl font-extrabold ${style.accent} mb-2`}>
                    {role.name}
                  </h2>
                  <p className="font-headline text-sm font-bold text-on-background/50 mb-6">
                    {role.keyPlayerStance ?? role.faction}
                  </p>

                  {/* Quote */}
                  <div className={`${style.quote} p-6 rounded-xl mb-8 relative`}>
                    <span className={`absolute -top-3 -left-3 ${style.quoteIcon} w-8 h-8 rounded-full flex items-center justify-center text-lg font-black`}>
                      "
                    </span>
                    <p className="font-body text-base italic leading-relaxed">
                      {role.quote}
                    </p>
                  </div>

                  {/* Stat bar */}
                  <div className="mt-auto space-y-3">
                    <div className="flex justify-between items-center text-xs font-headline font-bold">
                      <span className="text-on-background/50 uppercase tracking-tighter">Strategic Difficulty</span>
                      <span className={`${style.accent} uppercase tracking-tighter`}>{style.focus}</span>
                    </div>
                    <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                      <div
                        className={`${style.bar} h-full rounded-full transition-all duration-700`}
                        style={{ width: `${statValue}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* CTA */}
      <div className="mt-20 flex flex-col items-center gap-4">
        <button
          onClick={handleStart}
          disabled={!selectedId}
          className="bg-primary text-on-primary font-headline font-extrabold text-lg px-12 py-5 rounded-full shadow-[0_32px_64px_-15px_rgba(51,111,84,0.3)] hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:scale-100 disabled:cursor-not-allowed flex items-center gap-3"
        >
          Start Mission →
        </button>
        <p className="font-label text-[11px] font-semibold text-on-background/40 uppercase tracking-[0.2em]">
          {selectedId ? 'Deployment protocols confirmed' : 'Select a faction to continue'}
        </p>
      </div>
    </div>
  )
}
