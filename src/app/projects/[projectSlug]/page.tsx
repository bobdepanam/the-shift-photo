// src/app/projects/[projectSlug]/page.tsx

import { notFound } from 'next/navigation'
import { getProjectBySlug } from '@/lib/project'
import ProjectPageClient from './ProjectPageClient'

export default async function Page({ params }: { params: { projectSlug: string } }) {
  const project = await getProjectBySlug(params.projectSlug)

  if (!project) return notFound()

  return <ProjectPageClient project={project} />
}
