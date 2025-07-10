// src/app/projects/[slug]/page.tsx

import { notFound } from 'next/navigation'
import { getAllProjects } from '@/data/projects/getAllProjects'
import ProjectPageClient from './ProjectPageClient'
import { Project } from '@/types/project'

type Props = {
  params: {
    slug: string
  }
}

// Génération statique des slugs (SSG)
export async function generateStaticParams() {
  const projects = await getAllProjects()
  return projects.map((project: Project) => ({
    slug: project.slug,
  }))
}

// Page serveur statique pour chaque projet
export default async function ProjectPage({ params }: Props) {
  const projects = await getAllProjects()
  const project = projects.find((p) => p.slug === params.slug)

  if (!project) return notFound()

  return (
    <main>
      <ProjectPageClient project={project} />
    </main>
  )
}
