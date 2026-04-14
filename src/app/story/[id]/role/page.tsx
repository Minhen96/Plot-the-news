import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import RoleSelector from '@/components/RoleSelector'
import { getStory } from '@/data/stories'
import { getStoryById } from '@/lib/stories'

export const revalidate = 3600

export default async function RoleSelectionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  // DB first (has real FAL.ai images) → static demo story fallback
  const story = await getStoryById(id).catch(() => undefined) ?? getStory(id)
  if (!story) notFound()

  return (
    <>
      <Header variant="article" brand="editorial" />

      <main className="pt-12 pb-32 px-6 max-w-7xl mx-auto">
        {/* Hero header */}
        <header className="mb-16 text-center">
          <span className="font-headline text-primary font-bold tracking-widest text-[11px] uppercase mb-4 block">
            Deployment Selection
          </span>
          <h1 className="font-headline text-4xl md:text-6xl font-extrabold tracking-tighter text-on-background mb-6">
            {story.title}
          </h1>
          <p className="font-body text-lg md:text-xl text-on-background/60 max-w-2xl mx-auto italic">
            Choose your lens. The narrative of history is shaped by those who hold the pen — and the sword.
          </p>
        </header>

        {/* Interactive card grid + CTA (client component) */}
        <RoleSelector storyId={id} roles={story.roles} />

        {/* Historical context callout */}
        {story.historicalContext && (
          <aside className="mt-24 p-8 bg-surface-container rounded-2xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-8 relative z-10">
              <div className="bg-tertiary-container/20 p-4 rounded-full shrink-0">
                <span className="text-tertiary text-4xl font-headline font-black">📜</span>
              </div>
              <div>
                <h4 className="font-headline text-xl font-bold text-on-background mb-2">
                  Did You Know?
                </h4>
                <p className="font-body text-on-background/70 max-w-3xl leading-relaxed">
                  {story.historicalContext}
                </p>
              </div>
            </div>
            {/* Decorative dot grid */}
            <div
              className="absolute inset-0 opacity-5 pointer-events-none"
              style={{ backgroundImage: 'radial-gradient(circle at center, #336f54 1px, transparent 1px)', backgroundSize: '24px 24px' }}
            />
          </aside>
        )}
      </main>
    </>
  )
}
