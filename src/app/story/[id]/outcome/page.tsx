import { notFound } from 'next/navigation'
import { getStory } from '@/data/stories'
import { getStoryById } from '@/lib/stories'
import OutcomeClient from '@/components/OutcomeClient'

export default async function OutcomePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const story = getStory(id) ?? await getStoryById(id).catch(() => undefined)

  if (!story) notFound()

  const lastPanel = story.panels[story.panels.length - 1]
  const panelBackgrounds = story.panels.map(p => p.backgroundUrl).filter(Boolean)

  return (
    <OutcomeClient
      storyId={id}
      storyTitle={story.title}
      panelBackgrounds={panelBackgrounds}
      characterPortrait={lastPanel?.characterPortrait ?? ''}
      characterName={lastPanel?.characterName ?? 'The Analyst'}
      historicalContext={story.historicalContext}
      historicalEvidence={story.historicalEvidence}
      cliffhanger={story.cliffhanger}
    />
  )
}
