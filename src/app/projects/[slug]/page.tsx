// src/app/projects/[slug]/page.tsx

import { notFound } from 'next/navigation'
import { getAllProjects } from '@/data/projects/getAllProjects'
import ProjectPageClient from './ProjectPageClient'
import type { Project } from '@/types/project'

// ✅ Typage large mais explicite — et accepté par Next
export default async function ProjectPage({
  params,
}: {
  params: { slug: string }
}) {
  const { slug } = params

  const projects = await getAllProjects()
  const project = projects.find((p) => p.slug === slug)

  if (!project) return notFound()

  return (
    <main>
      <ProjectPageClient project={project} />
    </main>
  )
}

export async function generateStaticParams() {
  const projects = await getAllProjects()
  return projects.map((project: Project) => ({
    slug: project.slug,
  }))
}
