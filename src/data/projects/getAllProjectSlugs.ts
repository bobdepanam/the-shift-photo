import { getAllProjects } from './getAllProjects'
import { Project } from '@/types/project'

export function getAllProjectSlugs(): { slug: string }[] {
  return getAllProjects().map((project: Project) => ({
    slug: project.slug,
  }))
}
