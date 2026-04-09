import Link from 'next/link'
import AuthButton from './AuthButton'

interface HeaderProps {
  brand?: 'editorial' | 'futurelens'
}

const NAV_TABS = [
  { label: 'World News', href: '/?category=world' },
  { label: 'Politics', href: '/?category=politics' },
  { label: 'Economy', href: '/?category=economy' },
  { label: 'Culture', href: '/?category=culture' },
  { label: 'Science', href: '/?category=science' },
  { label: 'Opinion', href: '/?category=opinion' },
  { label: 'Interactive', href: '/story/strait-of-hormuz' },
]

export default function Header({ brand = 'editorial' }: HeaderProps) {
  const date = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <header>
      {/* Top info bar */}
      <div className="flex justify-between items-center text-[10px] font-label font-bold tracking-widest uppercase mb-4 text-on-background/60">
        <span>{date}</span>
        <span className="hidden md:block">The Living Chronicle</span>
        <div className="flex items-center gap-5">
          <Link href="/archive" className="hover:text-primary transition-colors">
            Archive
          </Link>
          <Link href="/profile" className="hover:text-primary transition-colors">
            Profile
          </Link>
          <AuthButton />
        </div>
      </div>

      {/* Thick rule */}
      <div className="border-t-4 border-on-background mb-2" />

      {/* Masthead */}
      <h1
        className={`text-center font-headline font-extrabold tracking-tighter italic leading-none my-4 ${
          brand === 'editorial'
            ? 'text-7xl md:text-[7rem] text-on-background'
            : 'text-5xl md:text-7xl text-primary'
        }`}
      >
        {brand === 'editorial' ? 'The Illuminated Editorial' : 'FutureLens'}
      </h1>

      {/* Medium rule */}
      <div className="border-t border-on-background mb-4" />

      {/* Nav tabs — editorial only */}
      {brand === 'editorial' && (
        <nav className="flex flex-wrap justify-center gap-x-8 gap-y-2 font-label uppercase text-[10px] md:text-xs tracking-[0.2em] font-black border-b border-on-background/10 pb-4">
          {NAV_TABS.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className="hover:text-primary transition-colors"
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}
