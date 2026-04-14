import { notFound } from 'next/navigation'
import { getStory } from '@/data/stories'
import { getStoryById } from '@/lib/stories'
import PlayClient from '@/components/PlayClient'

export const revalidate = 3600

export default async function PlayPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const story = await getStoryById(id).catch(() => undefined) ?? getStory(id)

  if (!story) notFound()

  return (
    <PlayClient
      storyId={id}
      panels={story.panels}
      roles={story.roles}
    />
  )
}
