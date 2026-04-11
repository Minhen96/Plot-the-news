'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Scene, Role } from '@/lib/types'
import SimulationLoading from '@/components/SimulationLoading'

interface Props {
  storyId: string
  panels: Scene[]
  roles: Role[]
}

export default function PlayClient({ storyId, panels: initialPanels, roles: initialRoles }: Props) {
  const router = useRouter()

  const [activePanels, setActivePanels] = useState<Scene[]>(initialPanels)
  const [activeRoles, setActiveRoles] = useState<Role[]>(initialRoles)
  const [generatingImages, setGeneratingImages] = useState(false)
  const [currentPanel, setCurrentPanel] = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [isTyping, setIsTyping] = useState(true)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // On-demand image generation: if panels have Picsum placeholders, generate real images
  useEffect(() => {
    const isPicsum = initialPanels[0]?.backgroundUrl?.includes('picsum.photos') ?? false
    if (!isPicsum) return

    setGeneratingImages(true)
    fetch(`/api/stories/${storyId}/generate-images`, { method: 'POST' })
      .then((r: Response) => r.ok ? r.json() : Promise.reject())
      .then(data => {
        if (data.panels?.length) setActivePanels(data.panels)
        if (data.roles?.length) setActiveRoles(data.roles)
      })
      .catch(() => { /* keep Picsum if FAL.ai fails */ })
      .finally(() => setGeneratingImages(false))
  }, [storyId, initialPanels])

  const panel = activePanels[currentPanel]

  // Read role from sessionStorage to show correct portrait
  const [roleId, setRoleId] = useState<string | null>(null)
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('game_role')
      if (stored) setRoleId(JSON.parse(stored).roleId)
    } catch { /* ignore */ }
  }, [])

  const activeRole = activeRoles.find((r: Role) => r.id === roleId) ?? activeRoles[0]

  // Typewriter effect
  useEffect(() => {
    const full = panel.dialogue
    setDisplayed('')
    setIsTyping(true)
    let i = 0
    intervalRef.current = setInterval(() => {
      i++
      setDisplayed(full.slice(0, i))
      if (i >= full.length) {
        clearInterval(intervalRef.current!)
        setIsTyping(false)
      }
    }, 28)
    return () => clearInterval(intervalRef.current!)
  }, [currentPanel, panel.dialogue])

  const handleClick = useCallback(() => {
    if (isTyping) {
      clearInterval(intervalRef.current!)
      setDisplayed(panel.dialogue)
      setIsTyping(false)
      return
    }
    if (currentPanel < activePanels.length - 1) {
      setCurrentPanel((p: number) => p + 1)
    } else {
      router.push(`/story/${storyId}/predict`)
    }
  }, [isTyping, currentPanel, activePanels.length, panel.dialogue, storyId, router])

  if (generatingImages) {
    return <SimulationLoading />
  }

  return (
    <div
      className="relative w-full h-screen overflow-hidden flex flex-col"
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
    >
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        {panel.backgroundUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={panel.backgroundUrl}
            alt=""
            className="w-full h-full object-cover"
            style={{ filter: 'grayscale(20%) sepia(10%)' }}
          />
        ) : (
          <div className="w-full h-full bg-on-surface" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#fefdf1] via-transparent to-transparent opacity-40" />
      </div>

      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-[#fefdf1]/80 backdrop-blur-md shadow-sm flex justify-between items-center px-6 py-4">
        <span className="text-xl font-black text-primary tracking-tighter font-headline">
          The Illuminated Editorial
        </span>
        <nav className="hidden md:flex items-center gap-8 font-headline text-sm font-bold tracking-tight">
          <Link href="/" className="text-primary font-bold">Chronicle</Link>
          <Link href="/archive" className="text-on-surface/50 hover:bg-surface-container-high/50 transition-all px-3 py-1 rounded-full">Archive</Link>
          <Link href={`/story/${storyId}/role`} className="text-on-surface/50 hover:bg-surface-container-high/50 transition-all px-3 py-1 rounded-full">Roles</Link>
          <Link href="/profile" className="text-on-surface/50 hover:bg-surface-container-high/50 transition-all px-3 py-1 rounded-full">Profile</Link>
        </nav>
        <div className="w-6" /> {/* spacer */}
      </header>

      {/* Sector badge HUD */}
      <div className="absolute top-28 left-8 z-20 flex flex-col gap-4">
        <div className="bg-surface-container/80 backdrop-blur-sm p-4 rounded-lg flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-primary text-lg">
            ◎
          </div>
          <div>
            <div className="text-[10px] font-headline font-bold text-outline uppercase tracking-widest">
              Current Sector
            </div>
            <div className="font-headline font-bold text-on-surface text-sm">
              {panel.sectorBadge}
            </div>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <main className="relative z-10 w-full max-w-6xl mx-auto px-8 h-full flex flex-col justify-end pb-32 pt-16">
        <div className="flex items-end gap-6">

          {/* Character portrait */}
          <div className="flex-shrink-0 w-48 md:w-64 h-[400px] relative">
            <div className="absolute bottom-0 w-full aspect-[3/4] rounded-t-full overflow-hidden bg-surface-container-high shadow-lg">
              {(activeRole?.portraitUrl || panel.characterPortrait) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={activeRole?.portraitUrl || panel.characterPortrait}
                  alt={panel.characterName}
                  className="w-full h-full object-cover"
                  style={{ filter: 'grayscale(10%)' }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-b from-primary/20 to-primary/40" />
              )}
            </div>
            {/* Character name label */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full pt-2">
              <span className="bg-primary text-on-primary font-headline font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-full whitespace-nowrap">
                {panel.characterName}
              </span>
            </div>
          </div>

          {/* Speech bubble */}
          <div className="flex-grow mb-4">
            <div className="relative bg-surface-container-lowest/90 backdrop-blur-xl p-8 md:p-10 rounded-2xl md:rounded-3xl shadow-[0_32px_64px_-15px_rgba(53,58,38,0.12)] border-l-8 border-primary">
              <div className="max-w-3xl">
                <p className="font-body text-xl md:text-2xl leading-relaxed text-on-surface min-h-[80px]">
                  {displayed}
                  {isTyping && <span className="animate-pulse">▍</span>}
                </p>
              </div>

              {/* Click to continue */}
              <div className="absolute bottom-6 right-8 flex items-center gap-2">
                <span className="font-headline text-[10px] font-bold uppercase tracking-[0.2em] text-outline">
                  {isTyping ? 'Click to skip' : currentPanel < activePanels.length - 1 ? 'Click to continue' : 'Click to proceed'}
                </span>
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_12px_rgba(51,111,84,0.4)]" />
              </div>

              {/* Panel progress dots */}
              <div className="absolute -top-4 -right-4 flex gap-1.5 bg-surface-container-lowest/80 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-sm">
                {activePanels.map((_: Scene, i: number) => (
                  <div
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentPanel ? 'bg-primary w-3' : i < currentPanel ? 'bg-primary/40' : 'bg-outline/30'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile bottom nav */}
      <footer className="md:hidden fixed bottom-0 w-full h-20 bg-[#fefdf1]/80 backdrop-blur-xl rounded-t-[2rem] shadow-[0_-8px_30px_rgba(53,58,38,0.04)] flex justify-around items-center px-4 z-50">
        {[
          { label: 'Chronicle', icon: '📰', href: '/' },
          { label: 'Archive', icon: '📚', href: '/archive' },
          { label: 'Roles', icon: '👥', href: `/story/${storyId}/role` },
          { label: 'Profile', icon: '👤', href: '/profile' },
        ].map(({ label, icon, href }) => (
          <Link
            key={label}
            href={href}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            className="flex flex-col items-center justify-center text-on-surface/40 gap-0.5"
          >
            <span className="text-lg">{icon}</span>
            <span className="font-headline text-[11px] font-semibold uppercase tracking-widest">{label}</span>
          </Link>
        ))}
      </footer>
    </div>
  )
}
