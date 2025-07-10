// ✅ Étape 1 – imports nécessaires
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { getProjectBySlug, getAllProjectSlugs } from '@/lib/project'
import ProjectPageClient from './ProjectPageClient'
import { Project } from '@/types/project'

// ✅ Étape 2 – static generation des slugs (SSG)
export async function generateStaticParams() {
  const slugs = await getAllProjectSlugs()
  return slugs.map(({ slug }) => ({ slug }))
}

// ✅ Étape 3 – petite fonction pour fetch les données du projet
async function getData(slug: string): Promise<Project | null> {
  const project = await getProjectBySlug(slug)
  return project
}

// ✅ Étape 4 – composant principal Page (⛔️ doit rester synchrone pour Next.js 15)
export default function Page({ params }: { params: { slug: string } }) {
  const projectPromise = getData(params.slug)

  return (
    // ✅ Étape 5 – Suspense pour gérer l'attente des données (fallback temporaire)
    <Suspense fallback={<div className="loading">Chargement du projet...</div>}>
      <AsyncProject projectPromise={projectPromise} />
    </Suspense>
  )
}

// ✅ Étape 6 – composant async séparé, c’est ici qu’on attend le fetch
async function AsyncProject({ projectPromise }: { projectPromise: Promise<Project | null> }) {
  const project = await projectPromise

  if (!project) return notFound()

  // ✅ Étape 7 – envoie le projet à ton composant client (déjà existant)
  return <ProjectPageClient project={project} />
}
