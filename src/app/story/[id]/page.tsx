import Link from 'next/link'
import Header from '@/components/Header'
import LiveArticleView from '@/components/LiveArticleView'
import { getStory } from '@/data/stories'
import { getStoryById } from '@/lib/stories'

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  // DB first (has real FAL.ai images) → static demo story fallback
  const story = await getStoryById(id).catch(() => undefined) ?? getStory(id)

  if (!story || (!story.isGenerated && !story.id.startsWith('static-'))) {
    return (
      <>
        <Header variant="article" brand="editorial" />
        <LiveArticleView slug={id} />
      </>
    )
  }

  const formattedDate = new Date(story.date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <>
      <Header variant="article" brand="editorial" />

      <main className="max-w-4xl mx-auto px-6 pt-12 pb-24">

        {/* Breadcrumb & metadata */}
        <div className="mb-10 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-on-surface/50 font-label text-xs uppercase tracking-widest font-bold">
            <Link href="/" className="hover:text-primary transition-colors">The Chronicle</Link>
            <span>›</span>
            <span className="text-primary">{story.category}</span>
          </div>

          <h2 className="font-headline text-5xl md:text-6xl font-extrabold text-on-surface leading-[1.1] tracking-tight">
            {story.title}
          </h2>

          <div className="flex items-center gap-4 mt-2">
            <div className="w-10 h-10 rounded-full bg-surface-container overflow-hidden shrink-0">
              <div className="w-full h-full bg-linear-to-br from-primary/20 to-primary-container/40" />
            </div>
            <div>
              <p className="font-headline font-bold text-sm text-on-surface">By Elias Thorne</p>
              <p className="font-body text-sm text-on-surface/60 italic">
                Foreign Affairs Analyst · {formattedDate}
              </p>
            </div>
          </div>
        </div>

        {/* Hero image */}
        <div className="relative group mb-16">
          <div className="absolute -top-6 -left-6 w-24 h-24 bg-primary-container/20 rounded-full blur-3xl -z-10" />
          <div className="rounded-xl overflow-hidden bg-surface-container-high aspect-video">
            {story.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={story.imageUrl}
                alt={story.title}
                className="w-full h-full object-cover transition-all duration-700 scale-105 hover:scale-100"
              />
            ) : (
              <div className="w-full h-full bg-linear-to-br from-on-surface/70 via-on-surface/40 to-primary/20 flex items-end p-6">
                <span className="text-surface/60 font-label text-xs uppercase tracking-widest">
                  Naval operations · Strait of Hormuz
                </span>
              </div>
            )}
          </div>
          <p className="mt-4 font-body text-sm text-on-surface/50 italic text-center max-w-2xl mx-auto">
            &ldquo;The narrow artery of global commerce in the Strait of Hormuz remains the
            primary theater for a decades-long chess match between Washington and Tehran.&rdquo;
          </p>
        </div>

        {/* Article body */}
        <article className="mb-16 space-y-6">
          {story.articleBody.map((paragraph, i) => (
            <p
              key={i}
              className={`font-body leading-relaxed text-on-surface ${
                i === 0
                  ? 'text-xl md:text-2xl first-letter:text-7xl first-letter:font-bold first-letter:text-primary first-letter:mr-3 first-letter:float-left first-letter:font-headline first-letter:leading-none'
                  : 'text-lg'
              }`}
            >
              {paragraph}
            </p>
          ))}
        </article>

        {/* Summary of impact */}
        <div className="bg-surface-container-low rounded-lg p-8 mb-12 border-l-4 border-primary">
          <h3 className="font-headline font-bold text-sm mb-4 uppercase tracking-wider text-primary">
            Summary of Impact
          </h3>
          <ul className="space-y-4">
            {[
              'Global oil prices remain highly sensitive to maritime incidents, with a projected 10% premium on insurance for tankers in the Gulf.',
              'Regional stability in the Levant and Yemen is increasingly tied to the outcome of direct and indirect U.S.–Iran communications.',
              'Active diplomatic backchannels through Oman and Qatar remain the only firewall against unintended kinetic escalation.',
            ].map((point) => (
              <li key={point} className="flex items-start gap-3">
                <span className="text-primary mt-1 shrink-0">◆</span>
                <span className="font-body text-on-surface text-base leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Enter the game CTA */}
        <div className="flex flex-col items-center justify-center py-16 px-8 rounded-xl bg-linear-to-br from-primary to-on-surface text-white mb-20">
          <h4 className="font-headline text-3xl font-bold mb-4 text-center">
            Inside the Shadow War
          </h4>
          <p className="font-body text-lg opacity-90 text-center mb-10 max-w-lg leading-relaxed">
            Experience the high-stakes world of maritime brinkmanship through an immersive
            visual narrative. Pick your faction. Lock your prediction on-chain.
          </p>
          <Link
            href={`/story/${id}/role`}
            className="bg-primary-container text-on-surface px-12 py-5 rounded-full font-headline font-bold text-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
          >
            ✦ Launch Interactive Comic
          </Link>
        </div>

        {/* Deep Dive */}
        {(story.historicalEvidence || story.references) && (
          <section className="mt-20 pt-16 border-t border-outline-variant/30">
            <div className="flex items-center gap-4 mb-12">
              <div className="h-px flex-1 bg-outline-variant/30" />
              <h3 className="font-headline text-sm font-black uppercase tracking-[0.3em] text-on-surface/50">
                Deep Dive
              </h3>
              <div className="h-px flex-1 bg-outline-variant/30" />
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              {story.historicalEvidence && (
                <div className="space-y-4">
                  <h4 className="font-headline font-bold text-2xl text-on-surface">
                    📜 Historical Evidence
                  </h4>
                  <div className="p-8 rounded-lg bg-surface-container-high">
                    <h5 className="font-headline font-bold text-tertiary mb-3">
                      {story.historicalEvidence.title}
                    </h5>
                    <p className="font-body text-on-surface leading-relaxed italic mb-4">
                      &ldquo;{story.historicalEvidence.quote}&rdquo;
                    </p>
                    <p className="font-body text-sm text-on-surface/60">
                      {story.historicalEvidence.summary}
                    </p>
                  </div>
                </div>
              )}

              {story.references && (
                <div className="space-y-4">
                  <div className="flex flex-col gap-1 mb-2">
                    <h4 className="font-headline font-bold text-2xl text-on-surface">
                      🌍 Real references
                    </h4>
                    <p className="font-body text-sm text-on-surface/60 italic">
                      Real-world, verified sources grounding this scenario.
                    </p>
                  </div>
                  <ul className="space-y-3">
                    {story.references.map((ref) => (
                      <li key={ref.title}>
                        <a
                          href={ref.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center justify-between p-4 rounded-xl bg-surface-container-low hover:bg-surface-container-lowest hover:shadow-sm border border-outline-variant/15 hover:border-primary/30 transition-all"
                        >
                          <div className="flex flex-col">
                            <span className="font-headline font-bold text-sm text-on-surface group-hover:text-primary transition-colors">
                              {ref.title}
                            </span>
                            <span className="font-label text-[10px] uppercase tracking-widest text-tertiary mt-1">
                              {ref.source}
                            </span>
                          </div>
                          <span className="text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all shrink-0 ml-3">
                            ↗
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      <footer className="w-full border-t border-outline-variant/20 bg-surface-container">
        <div className="flex flex-col items-center justify-center py-12 px-8 gap-6">
          <Link href="/">
            <h2 className="text-2xl font-bold text-on-surface font-body italic hover:text-primary transition-colors">
              The Illuminated Editorial
            </h2>
          </Link>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
            {['About Us', 'Archives', 'Privacy Policy', 'Terms of Service', 'Contact', 'Newsletters'].map(
              (l) => (
                <a key={l} href="#" className="font-label text-sm text-on-surface/60 hover:text-primary underline underline-offset-4 transition-colors">
                  {l}
                </a>
              )
            )}
          </div>
          <p className="font-label text-sm text-center max-w-md text-on-surface/50 italic">
            © 2026 The Illuminated Editorial · FutureLens. All Rights Reserved.
          </p>
        </div>
      </footer>
    </>
  )
}
