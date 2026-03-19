// src/lib/getAllProjectSlugs.ts

import { getAllProjects } from './getAllProjects'
import { Project } from '@/types/project'

/**
 * Retourne tous les slugs de projets disponibles
 * pour générer des routes statiques dynamiques (SSG).
 */
export async function getAllProjectSlugs(): Promise<{ slug: string }[]> {
  const projects: Project[] = await getAllProjects()

  return projects.map((project) => ({
    slug: project.slug,
  }))
}
