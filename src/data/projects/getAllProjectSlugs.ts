// src/lib/getAllProjectSlugs.ts

import { getAllProjects } from './getAllProjects'
import { Project } from '@/types/project'

/**
 * Retourne tous les slugs de projets disponibles
 * pour générer des routes statiques dynamiques (SSG).
 */
export function getAllProjectSlugs(): { slug: string }[] {
  const projects: Project[] = getAllProjects()

  return projects.map((project) => ({
    slug: project.slug,
  }))
}
