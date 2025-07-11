// src/lib/project.ts

import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'
import { Project } from '@/types/project'

const projectsDir = path.join(process.cwd(), 'src/data/projects')

export async function getAllProjectSlugs(): Promise<{ slug: string }[]> {
  const files = await fs.readdir(projectsDir)

  return files
    .filter((file) => file.endsWith('.md') && file !== 'archive.md')
    .map((file) => ({
      slug: file.replace(/\.md$/, ''),
    }))
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  try {
    const filePath = path.join(projectsDir, `${slug}.md`)
    const file = await fs.readFile(filePath, 'utf-8')
    const { data, content } = matter(file)

    return {
      title: data.title,
      slug,
      category: data.category,
      media: data.media ?? [],
      content: content.trim(),
    }
  } catch (error) {
    console.error(`Erreur getProjectBySlug(${slug})`, error)
    return null
  }
}
