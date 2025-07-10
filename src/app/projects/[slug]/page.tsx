// app/projects/[slug]/page.tsx

import { notFound } from 'next/navigation'
import { getProjectBySlug, getAllProjectSlugs } from '@/lib/project'
import ProjectPageClient from './ProjectPageClient'
import { Project } from '@/types/project'

type Props = {
  params: {
    slug: string
  }
}

export async function generateStaticParams() {
  const slugs = await getAllProjectSlugs()
  return slugs.map(({ slug }) => ({ slug }))
}

export default async function Page({ params }: Props) {
  const slug = params.slug
  if (!slug) return notFound()

  const project: Project | null = await getProjectBySlug(slug)
  if (!project) return notFound()

  return <ProjectPageClient project={project} />
}
