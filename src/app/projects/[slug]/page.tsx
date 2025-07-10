// src/app/projects/[slug]/page.tsx

import { notFound } from 'next/navigation'
import { getAllProjects } from '@/data/projects/getAllProjects'
import ProjectPageClient from './ProjectPageClient'
import { Project } from '@/types/project'

// Génération statique des slugs
export async function generateStaticParams() {
  const projects = await getAllProjects()
  return projects.map((project: Project) => ({
    slug: project.slug,
  }))
}

// ✅ Typage explicite sans créer de type custom
export default async function ProjectPage({
  params,
}: {
  params: { slug: string }
}) {
  const projects = await getAllProjects()
  const project = projects.find((p) => p.slug === params.slug)

  if (!project) return notFound()

  return (
    <main>
      <ProjectPageClient project={project} />
    </main>
  )
}
