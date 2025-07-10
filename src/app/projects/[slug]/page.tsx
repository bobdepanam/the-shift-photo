// src/app/projects/[slug]/page.tsx

import { notFound } from 'next/navigation'
import { getAllProjects } from '@/data/projects/getAllProjects'
import ProjectPageClient from './ProjectPageClient'
import type { Project } from '@/types/project'

// Typage safe et accepté par Next.js 15.3
interface Props {
  params?: {
    slug?: string
  }
}

export async function generateStaticParams() {
  const projects = await getAllProjects()
  return projects.map((project: Project) => ({
    slug: project.slug,
  }))
}

export default async function ProjectPage({ params }: Props) {
  const slug = params?.slug

  if (!slug) return notFound()

  const projects = await getAllProjects()
  const project = projects.find((p) => p.slug === slug)

  if (!project) return notFound()

  return (
    <main>
      <ProjectPageClient project={project} />
    </main>
  )
}
