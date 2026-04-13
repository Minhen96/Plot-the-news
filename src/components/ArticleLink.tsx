'use client'

import Link from 'next/link'
import type { NewsArticle } from '@/lib/types'
import { toStorySlug } from '@/lib/utils'

interface Props {
  article:   NewsArticle
  className?: string
  children:  React.ReactNode
}

export default function ArticleLink({ article, className, children }: Props) {
  const isInternal = article.url.startsWith('/story/')
  const slug = isInternal ? article.url.split('/').pop() || '' : toStorySlug(article.title)
  const href = isInternal ? article.url : `/story/${slug}`

  function handleClick() {
    try {
      sessionStorage.setItem(`article:${slug}`, JSON.stringify(article))
    } catch {
      // sessionStorage unavailable — navigate anyway, LiveArticleView handles the missing state
    }
  }

  return (
    <Link href={`/story/${slug}`} className={className} onClick={handleClick}>
      {children}
    </Link>
  )
}
