// src/app/projects/[projectSlug]/page.tsx

import { notFound } from 'next/navigation'
import { getAllProjectSlugs, getProjectBySlug } from '@/lib/project'
import { getPublicImageSize } from '@/utils/imageSize'
import ProjectPageClient from './ProjectPageClient'

// Pages projet générées au build : les dimensions des images (public/) sont lues à ce moment-là.
// Un slug inconnu reste rendu à la demande et répond par notFound(), comme avant.
export async function generateStaticParams() {
  const slugs = await getAllProjectSlugs()
  return slugs.map(({ slug }) => ({ projectSlug: slug }))
}

export default async function Page({ params }: { params: { projectSlug: string } }) {
  const project = await getProjectBySlug(params.projectSlug)

  if (!project) return notFound()

  // Vraies dimensions des images : la place est réservée au bon ratio avant chargement,
  // les images au-dessus d'une ancre #m-index ne décalent plus la cible.
  const media = project.media.map((item) => {
    if (item.type !== 'image') return item
    const size = getPublicImageSize(item.src)
    return size ? { ...item, ...size } : item
  })

  return <ProjectPageClient project={{ ...project, media }} />
}
