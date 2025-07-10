import { notFound } from 'next/navigation'
import { getProjectBySlug, getAllProjectSlugs } from '@/lib/project'
import ProjectPageClient from './ProjectPageClient'
import { Project } from '@/types/project'

// Props = Promise avec params car Next.js 15+ passe props sous forme de Promise
type Props = Promise<{ params: { slug: string } }>

export async function generateStaticParams() {
  const slugs = await getAllProjectSlugs()
  return slugs.map(({ slug }) => ({ slug }))
}

export default async function Page(props: Props) {
  // Obligé d'attendre props avant d'accéder à params
  const { params } = await props
  const slug = params.slug

  if (!slug) return notFound()

  const project: Project | null = await getProjectBySlug(slug)

  if (!project) return notFound()

  return <ProjectPageClient project={project} />
}
