// src/data/projects/getAllCategories.ts
import { getAllProjects } from '@/data/projects/getAllProjects'

export async function getAllCategories() {
  const projects = await getAllProjects()
  const set = new Set<string>()
  for (const p of projects) {
    if (p?.category) set.add(p.category)
  }
  return Array.from(set)
}
