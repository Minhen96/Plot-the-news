import Link from 'next/link'
import AuthButton from './AuthButton'
import MobileNav from './MobileNav'

interface HeaderProps {
  brand?: 'editorial' | 'futurelens'
  variant?: 'hub' | 'article'
  activeCategory?: string
}

const NAV_TABS = [
  { label: 'World',       href: '/?category=world',        category: 'world' },
  { label: 'Politics',    href: '/?category=politics',     category: 'politics' },
  { label: 'Economy',     href: '/?category=economy',      category: 'economy' },
  { label: 'Culture',     href: '/?category=culture',      category: 'culture' },
  { label: 'Science',     href: '/?category=science',      category: 'science' },
  { label: 'Health',      href: '/?category=health',       category: 'health' },
  { label: 'Sports',      href: '/?category=sports',       category: 'sports' },
  { label: 'Opinion',     href: '/?category=opinion',      category: 'opinion' },
  { label: 'Interactive', href: '/story/strait-of-hormuz', category: null },
]

function NavTabs({ activeCategory }: { activeCategory?: string }) {
  return (
    <>
      {NAV_TABS.map((tab) => {
        const isActive = tab.category !== null && tab.category === activeCategory
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`transition-colors ${
              isActive
                ? 'text-primary border-b-2 border-primary pb-1'
                : 'hover:text-primary'
            }`}
          >
            {tab.label}
          </Link>
        )
      })}
    </>
  )
}

// Compact sticky nav — used on Article, Archive, Profile pages
function ArticleNav({ brand }: { brand: 'editorial' | 'futurelens' }) {
  const wordmark = brand === 'editorial' ? 'The Illuminated Editorial' : 'FutureLens'
  return (
    <nav className="w-full sticky top-0 z-50 bg-surface-container-low border-b border-outline-variant/10 py-5 px-6 md:px-12">
      <div className="flex flex-col items-center gap-4 max-w-screen-2xl mx-auto">
        <div className="flex items-center justify-between w-full">
          <Link href="/" className="text-on-surface/50 hover:text-on-surface transition-colors text-sm font-label">
            ←
          </Link>
          <Link href="/">
            <h1 className="text-3xl md:text-5xl font-black text-on-surface font-body italic">
              {wordmark}
            </h1>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/archive" className="text-[10px] font-label font-black uppercase tracking-widest opacity-60 hover:opacity-100 hover:text-primary transition-all hidden md:block">
              Archive
            </Link>
            <AuthButton />
          </div>
        </div>
        <div className="hidden md:flex gap-8 font-label uppercase tracking-widest font-bold text-on-surface/60 text-xs">
          <NavTabs />
        </div>
      </div>
    </nav>
  )
}

// Full broadsheet masthead — used on Chronicle Hub only
function HubMasthead({ brand, activeCategory }: { brand: 'editorial' | 'futurelens'; activeCategory?: string }) {
  const date = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  return (
    <header>
      <div className="flex justify-between items-center text-[10px] font-label font-bold tracking-widest uppercase mb-4 text-on-background/60">
        <span>{date}</span>
        <span className="hidden md:block">The Living Chronicle</span>
        <div className="flex items-center gap-5">
          <Link href="/archive" className="hover:text-primary transition-colors hidden md:block">Archive</Link>
          <Link href="/profile" className="hover:text-primary transition-colors hidden md:block">Profile</Link>
          <AuthButton />
          <MobileNav activeCategory={activeCategory} />
        </div>
      </div>
      <div className="border-t-4 border-on-background mb-2" />
      <h1
        className={`text-center font-headline font-extrabold tracking-tighter italic leading-none my-4 ${
          brand === 'editorial'
            ? 'text-7xl md:text-[7rem] text-on-background'
            : 'text-5xl md:text-7xl text-primary'
        }`}
      >
        {brand === 'editorial' ? 'The Illuminated Editorial' : 'FutureLens'}
      </h1>
      <div className="border-t border-on-background mb-4" />
      {brand === 'editorial' && (
        <nav className="hidden md:flex flex-wrap justify-center gap-x-8 gap-y-2 font-label uppercase text-[10px] md:text-xs tracking-[0.2em] font-black border-b border-on-background/10 pb-4">
          <NavTabs activeCategory={activeCategory ?? 'world'} />
        </nav>
      )}
    </header>
  )
}

export default function Header({ brand = 'editorial', variant = 'hub', activeCategory }: HeaderProps) {
  if (variant === 'article') return <ArticleNav brand={brand} />
  return <HubMasthead brand={brand} activeCategory={activeCategory} />
}
