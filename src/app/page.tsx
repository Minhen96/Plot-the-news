import Link from 'next/link'
import Header from '@/components/Header'
import { fetchGNewsArticles } from '@/lib/gnews'
import type { GNewsArticle } from '@/lib/types'

// Fallback articles shown when no GNews API key is present
const WORLD_FALLBACK: GNewsArticle[] = [
  {
    title: 'The Amazon\'s Last Breath: Satellite Data Reveals Accelerating Shifts',
    description:
      'Unprecedented shifts in the rainforest\'s ecosystem demand immediate global conservation efforts as tipping points loom.',
    url: '#',
    image: null,
    publishedAt: new Date().toISOString(),
    source: { name: 'Editorial', url: '#' },
  },
  {
    title: 'Urban Gridlock: The True Cost of Modern Mobility',
    description:
      'Infrastructure failures in major cities are costing the global economy trillions in lost productivity annually.',
    url: '#',
    image: null,
    publishedAt: new Date().toISOString(),
    source: { name: 'Editorial', url: '#' },
  },
]

const ECONOMY_FALLBACK: GNewsArticle[] = [
  {
    title: 'The Rebirth of Local Currency',
    description: 'Small communities are turning to hyper-local bartering systems.',
    url: '#',
    image: null,
    publishedAt: new Date().toISOString(),
    source: { name: 'Editorial', url: '#' },
  },
  {
    title: 'Market Analysis: The Circuit Pulse',
    description: 'Tech stocks fluctuate as supply chains tighten further.',
    url: '#',
    image: null,
    publishedAt: new Date().toISOString(),
    source: { name: 'Editorial', url: '#' },
  },
]

function ArticleImage({
  src,
  alt,
  className,
}: {
  src: string | null
  alt: string
  className: string
}) {
  if (!src) {
    return <div className={`${className} bg-surface-container-high`} />
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={className} />
  )
}

export default async function ChronicleHub() {
  const [worldArticles, economyArticles] = await Promise.all([
    fetchGNewsArticles('world', 3),
    fetchGNewsArticles('business', 2),
  ])

  const world = worldArticles.length > 0 ? worldArticles : WORLD_FALLBACK
  const economy = economyArticles.length > 0 ? economyArticles : ECONOMY_FALLBACK

  return (
    <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-6">
      <Header brand="editorial" />

      <main className="mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr_1fr] gap-8">

          {/* ── Left column: World News + Opinion ── */}
          <aside className="space-y-8">
            <section>
              <h4 className="font-headline font-black uppercase text-xs tracking-widest mb-4 border-b-2 border-on-background pb-1 w-fit">
                World News
              </h4>
              <div className="space-y-6">
                {/* First article: no image */}
                <article className="group">
                  <h5 className="text-xl font-headline font-bold leading-tight mb-2 group-hover:underline">
                    {world[0]?.title}
                  </h5>
                  <p className="text-sm opacity-80 leading-relaxed mb-3 font-body">
                    {world[0]?.description}
                  </p>
                  <a
                    href={world[0]?.url ?? '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] font-label font-black uppercase tracking-widest text-primary"
                  >
                    Enter Story →
                  </a>
                </article>

                <div className="border-t border-outline/20" />

                {/* Second article: with image */}
                {world[1] && (
                  <article className="group">
                    <h5 className="text-xl font-headline font-bold leading-tight mb-2 group-hover:underline">
                      {world[1].title}
                    </h5>
                    <ArticleImage
                      src={world[1].image}
                      alt={world[1].title}
                      className="w-full h-32 object-cover mb-3 grayscale hover:grayscale-0 transition-all duration-500"
                    />
                    <p className="text-sm opacity-80 leading-relaxed font-body">
                      {world[1].description}
                    </p>
                  </article>
                )}
              </div>
            </section>

            <div className="border-t border-outline/20" />

            <section>
              <h4 className="font-headline font-black uppercase text-xs tracking-widest mb-4 border-b-2 border-on-background pb-1 w-fit">
                Opinion
              </h4>
              <article>
                <span className="italic text-sm font-body mb-1 block opacity-70">
                  By Dr. Aris Vane
                </span>
                <h5 className="text-2xl font-body italic font-bold leading-tight mb-2">
                  Beyond the Neural Net: A Philosophical Crisis
                </h5>
                <p className="text-sm opacity-80 leading-relaxed font-body">
                  The emergence of conscious-adjacent algorithms is forcing us to redefine
                  what it means to be sentient in the age of machine foresight.
                </p>
              </article>
            </section>
          </aside>

          {/* ── Center column: Featured story ── */}
          <section className="lg:px-8 lg:border-x border-outline/15">
            <article className="flex flex-col gap-6">
              <div className="space-y-4">
                <span className="bg-primary text-on-primary px-3 py-1 rounded-sm text-[10px] font-label font-bold tracking-widest uppercase">
                  Lead Story
                </span>
                <h2 className="text-5xl md:text-7xl font-headline font-extrabold leading-[0.9] tracking-tighter text-on-background">
                  The Shadow of the Crescent: A Maritime Standoff
                </h2>
                <p className="text-2xl font-body italic opacity-90 leading-snug">
                  As geopolitical tensions escalate in the Strait of Hormuz, the world
                  watches a high-stakes chess match on the high seas.
                </p>
              </div>

              {/* Hero image placeholder — swap src when real image is ready */}
              <div className="relative">
                <div className="w-full aspect-video bg-linear-to-br from-on-surface/80 via-on-surface/50 to-primary/30 flex items-end p-4">
                  <span className="text-surface/80 font-label text-xs uppercase tracking-widest">
                    Naval maneuvers in the Strait of Hormuz
                  </span>
                </div>
                <p className="text-[10px] font-label mt-2 opacity-60 uppercase tracking-widest">
                  Photograph by Editorial Staff — DCAI Intelligence Imagery
                </p>
              </div>

              <div className="flex flex-col md:flex-row gap-8 py-6 border-y border-outline/15">
                <div className="flex-1">
                  <p className="text-base leading-relaxed opacity-90 mb-6 font-body">
                    In the emerald waters of the Persian Gulf, the silence of the dawn is
                    broken by the low hum of gas turbines. From the command decks of
                    American destroyers to the nimble fast-attack craft of the Iranian Guard,
                    the map of global commerce is being contested knot by knot.
                  </p>
                  <Link
                    href="/story/strait-of-hormuz"
                    className="inline-flex items-center gap-2 bg-on-background text-surface px-6 py-3 font-label font-black text-[10px] uppercase tracking-widest hover:bg-primary transition-colors"
                  >
                    Launch Interactive Comic →
                  </Link>
                </div>
                <div className="flex-1 space-y-4">
                  <p className="text-base leading-relaxed opacity-90 font-body">
                    Strategic experts warn that this &lsquo;Maritime Chessboard&rsquo; could
                    remain volatile for years, creating a potential choke point for global
                    trade not seen in decades of naval history.
                  </p>
                  <Link
                    href="/story/strait-of-hormuz"
                    className="text-primary font-bold underline decoration-primary/30 underline-offset-4 text-sm"
                  >
                    Continue reading the digital feature →
                  </Link>
                </div>
              </div>
            </article>
          </section>

          {/* ── Right column: Economy + Newsletter + Archive ── */}
          <aside className="space-y-8">
            <section>
              <h4 className="font-headline font-black uppercase text-xs tracking-widest mb-4 border-b-2 border-on-background pb-1 w-fit">
                Economy
              </h4>
              <div className="space-y-6">
                {economy.map((article) => (
                  <article key={article.title} className="flex gap-4 group cursor-pointer">
                    <div className="flex-1">
                      <h5 className="text-lg font-headline font-bold leading-tight mb-1 group-hover:text-primary transition-colors">
                        {article.title}
                      </h5>
                      <p className="text-xs opacity-70 font-body">{article.description}</p>
                    </div>
                    <ArticleImage
                      src={article.image}
                      alt={article.title}
                      className="w-16 h-16 object-cover grayscale shrink-0"
                    />
                  </article>
                ))}
              </div>
            </section>

            {/* Newsletter */}
            <div className="bg-surface-container p-6">
              <h5 className="font-headline font-black italic text-xl mb-3 text-on-background">
                The Editorial Brief
              </h5>
              <p className="text-sm mb-4 leading-relaxed italic opacity-80 font-body">
                Every Sunday, we distill the week&apos;s complexities into a narrative that
                matters. Delivered to your inbox.
              </p>
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full bg-surface-container-lowest border border-outline/20 px-4 py-2 text-xs mb-3 font-label outline-none focus:border-primary/40 transition-colors"
              />
              <button className="w-full bg-on-background text-surface py-2 text-[10px] font-label font-black uppercase tracking-widest hover:bg-primary transition-colors">
                Subscribe
              </button>
            </div>

            {/* Archive teaser */}
            <section>
              <h4 className="font-headline font-black uppercase text-xs tracking-widest mb-4 border-b-2 border-on-background pb-1 w-fit">
                The Archive
              </h4>
              <article className="group">
                <div className="w-full h-40 mb-3 bg-linear-to-br from-surface-container-high to-surface-container sepia-[0.3]" />
                <h5 className="text-xl font-headline font-bold mb-1 group-hover:text-primary transition-colors">
                  Verified Predictions, Immutable Proofs
                </h5>
                <p className="text-sm opacity-70 italic mb-2 font-body">
                  Oracle&apos;s Archive — on-chain resolved scenarios
                </p>
                <Link
                  href="/archive"
                  className="text-[10px] font-label font-bold uppercase tracking-widest border-b border-on-background hover:text-primary hover:border-primary transition-colors"
                >
                  View Archive
                </Link>
              </article>
            </section>
          </aside>

        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 pt-10 border-t-4 border-on-background">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-12">
          <div>
            <h2 className="text-3xl font-headline font-extrabold italic mb-4 leading-none text-on-background">
              The Illuminated Editorial
            </h2>
            <p className="max-w-md text-sm opacity-70 leading-relaxed font-body italic">
              Established 2026. A journal dedicated to the intersection of human narrative
              and systemic complexity. Powered by AI foresight and blockchain-verified truth.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-12 gap-y-4 font-label text-[10px] font-black uppercase tracking-widest">
            {['Archives', 'Ethics Policy', 'Masthead', 'Contact', 'Privacy', 'Newsletter'].map(
              (link) => (
                <a key={link} href="#" className="hover:text-primary transition-colors hover:underline">
                  {link}
                </a>
              )
            )}
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center py-6 border-t border-outline/20 text-[10px] font-label font-bold tracking-[0.2em] uppercase opacity-50">
          <span>© 2026 The Illuminated Editorial · FutureLens. All Rights Reserved.</span>
          <div className="flex gap-6 mt-4 md:mt-0">
            {['Twitter', 'Instagram', 'RSS'].map((s) => (
              <span key={s} className="cursor-pointer hover:opacity-100">
                {s}
              </span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
