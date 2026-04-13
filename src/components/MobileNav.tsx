'use client'

import { useState } from 'react'
import Link from 'next/link'

const NAV_TABS = [
  { label: 'World',         href: '/?category=world',         category: 'world' },
  { label: 'Breaking',      href: '/?category=breaking',      category: 'breaking' },
  { label: 'Crime',         href: '/?category=crime',         category: 'crime' },
  { label: 'Politics',      href: '/?category=politics',      category: 'politics' },
  { label: 'Finance',       href: '/?category=economy',       category: 'economy' },
  { label: 'Tech',          href: '/?category=tech',          category: 'tech' },
  { label: 'Health',        href: '/?category=health',        category: 'health' },
  { label: 'Sports',        href: '/?category=sports',        category: 'sports' },
  { label: 'Entertainment', href: '/?category=entertainment',   category: 'entertainment' },
]

const NAV_LINKS = [
  { label: 'Archive',  href: '/archive' },
  { label: 'Profile',  href: '/profile' },
]

interface Props {
  activeCategory?: string
}

export default function MobileNav({ activeCategory }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="md:hidden flex flex-col gap-1.5 p-2"
      >
        <span className="w-5 h-0.5 bg-on-background block" />
        <span className="w-5 h-0.5 bg-on-background block" />
        <span className="w-3.5 h-0.5 bg-on-background block" />
      </button>

      {/* Sidebar overlay */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-on-background/20 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Drawer */}
          <nav className="absolute top-0 right-0 h-full w-72 bg-surface-container-lowest shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-outline/10">
              <span className="font-headline font-black text-sm uppercase tracking-widest text-primary">
                Menu
              </span>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors font-headline font-black text-lg"
              >
                ✕
              </button>
            </div>

            {/* Categories */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <p className="font-label text-[10px] font-black uppercase tracking-widest text-on-background/40 mb-4">
                Categories
              </p>
              <div className="space-y-1">
                {NAV_TABS.map((tab) => {
                  const isActive = tab.category !== null && tab.category === activeCategory
                  return (
                    <Link
                      key={tab.href}
                      href={tab.href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-headline font-bold text-sm transition-colors ${
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'hover:bg-surface-container text-on-background/70 hover:text-on-background'
                      }`}
                    >
                      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                      {tab.label}
                    </Link>
                  )
                })}
              </div>

              <div className="border-t border-outline/10 my-6" />

              <p className="font-label text-[10px] font-black uppercase tracking-widest text-on-background/40 mb-4">
                Navigate
              </p>
              <div className="space-y-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl font-headline font-bold text-sm text-on-background/70 hover:bg-surface-container hover:text-on-background transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </nav>
        </div>
      )}
    </>
  )
}
