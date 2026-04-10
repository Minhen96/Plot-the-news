import { notFound } from 'next/navigation'
import { getStory } from '@/data/stories'
import { getStoryById } from '@/lib/stories'
import PlayClient from '@/components/PlayClient'

export default async function PlayPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const story = getStory(id) ?? await getStoryById(id).catch(() => undefined)

  if (!story) notFound()

  return (
    <PlayClient
      storyId={id}
      panels={story.panels}
      roles={story.roles}
    />
  )
}
