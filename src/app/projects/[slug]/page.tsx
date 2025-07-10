// src/app/[slug]/page.tsx

import { notFound } from 'next/navigation'
import { getAllProjects } from '@/data/projects/getAllProjects'
import ProjectPageClient from './ProjectPageClient'
// import type { Project } from '@/types/project'

type Props = {
  params: {
    slug: string
  }
}

// Génération statique des slugs (SSG)
export function generateStaticParams() {
  const projects = getAllProjects()
  return projects.map((project) => ({ slug: project.slug }))
}

// Page serveur statique pour chaque projet
export default async function ProjectPage({ params }: Props) {
  const { slug } = params
  const projects = getAllProjects()
  const project = projects.find((p) => p.slug === slug)

  if (!project) return notFound()

  return (
    <main>
      <ProjectPageClient project={project} />
    </main>
  )
}
