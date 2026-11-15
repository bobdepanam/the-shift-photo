// src/app/projects/[projectSlug]/page.tsx

import { notFound } from 'next/navigation'
import { getProjectBySlug } from '@/lib/project'
import { getPublicImageSize } from '@/utils/imageSize'
import ProjectPageClient from './ProjectPageClient'

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
