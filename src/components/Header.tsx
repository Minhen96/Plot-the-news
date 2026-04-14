import Link from 'next/link'
import AuthButton from './AuthButton'
import MobileNav from './MobileNav'

interface HeaderProps {
  brand?: 'editorial' | 'futurelens'
  variant?: 'hub' | 'article'
  activeCategory?: string
  isGeneratedFilter?: boolean
}

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

function NavTabs({ activeCategory, isGeneratedFilter }: { activeCategory?: string, isGeneratedFilter?: boolean }) {
  return (
    <>
      {NAV_TABS.map((tab) => {
        const isActive = tab.category !== null && tab.category === activeCategory
        // Preserve the generated filter when switching categories
        const queryParams = isGeneratedFilter ? `${tab.href}&generated=true` : tab.href
        return (
          <Link
            key={tab.href}
            href={queryParams}
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
    <nav className="w-full sticky top-0 z-50 bg-surface-container-low border-b border-outline-variant/10 py-5 px-4 md:px-6 lg:px-12">
      <div className="flex flex-col items-center gap-4 max-w-screen-2xl mx-auto">
        <div className="flex items-center justify-between w-full">
          <Link href="/" className="text-on-surface hover:text-primary transition-all flex items-center gap-2 font-label font-black uppercase tracking-[0.2em] text-[10px]">
            <span className="text-lg">←</span> 
          </Link>
          <Link href="/">
            <h1 className="text-2xl md:text-3xl lg:text-5xl font-black text-on-surface font-body italic truncate px-2">
              {wordmark}
            </h1>
          </Link>
          <div className="flex items-center gap-4 shrink-0">
            <Link href="/archive" className="text-[10px] font-label font-black uppercase tracking-widest opacity-60 hover:opacity-100 hover:text-primary transition-all hidden md:block">
              Archive
            </Link>
            <AuthButton />
          </div>
        </div>
      </div>
    </nav>
  )
}

// Full broadsheet masthead — used on Chronicle Hub only
function HubMasthead({ brand, activeCategory, isGeneratedFilter }: { brand: 'editorial' | 'futurelens'; activeCategory?: string, isGeneratedFilter?: boolean }) {
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
        <div className="flex items-center gap-3 md:gap-5">
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
            ? 'text-5xl md:text-7xl lg:text-[7rem] text-on-background'
            : 'text-4xl md:text-5xl lg:text-7xl text-primary'
        }`}
      >
        {brand === 'editorial' ? 'The Illuminated Editorial' : 'FutureLens'}
      </h1>
      <div className="border-t border-on-background mb-4" />
      {brand === 'editorial' && (
        <div className="relative hidden md:flex items-center justify-center border-b border-on-background/10 pb-4">
          <nav className="flex flex-wrap justify-center gap-x-8 gap-y-2 font-label uppercase text-[10px] md:text-xs tracking-[0.2em] font-black">
            <NavTabs activeCategory={activeCategory ?? 'world'} isGeneratedFilter={isGeneratedFilter} />
          </nav>
          <div className="absolute right-0 top-0 bottom-0 flex items-start mt-0.5">
            <Link 
              href={`/?category=${activeCategory ?? 'world'}${!isGeneratedFilter ? '&generated=true' : ''}`}
              className={`flex items-center gap-2 text-[10px] font-label uppercase tracking-widest font-black transition-colors ${isGeneratedFilter ? 'text-primary' : 'text-on-background/40 hover:text-on-background/80'}`}
              title="Show only simulated missions"
            >
              <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${isGeneratedFilter ? 'bg-primary border-primary' : 'border-current'}`}>
                {isGeneratedFilter && <div className="w-1.5 h-1.5 bg-background rounded-full" />}
              </div>
              Simulated Only
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

export default function Header({ brand = 'editorial', variant = 'hub', activeCategory, isGeneratedFilter }: HeaderProps) {
  if (variant === 'article') return <ArticleNav brand={brand} />
  return <HubMasthead brand={brand} activeCategory={activeCategory} isGeneratedFilter={isGeneratedFilter} />
}
