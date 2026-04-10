import { notFound } from 'next/navigation'
import { getStory } from '@/data/stories'
import { getStoryById } from '@/lib/stories'
import DirectivesClient from '@/components/DirectivesClient'

export default async function PredictPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const story = getStory(id) ?? await getStoryById(id).catch(() => undefined)

  if (!story) notFound()

  const lastPanel = story.panels[story.panels.length - 1]

  return (
    <DirectivesClient
      storyId={id}
      predictionOptions={story.predictionOptions}
      cliffhanger={story.cliffhanger ?? lastPanel?.dialogue ?? ''}
      characterName={lastPanel?.characterName ?? 'The Analyst'}
      characterPortrait={lastPanel?.characterPortrait ?? ''}
      backgroundUrl={lastPanel?.backgroundUrl ?? ''}
    />
  )
}
