// src/data/project/getAllProjects.ts
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export type MediaItem = {
  type: 'image' | 'video'
  src: string
}

export type Project = {
  title: string
  slug: string
  category: string
  media: MediaItem[]
  content: string
}

const projectsDirectory = path.join(process.cwd(), 'src/data/projects')

export function getAllProjects(): Project[] {
  const files = fs.readdirSync(projectsDirectory)
    .filter((file) => file.endsWith('.md') && file !== 'archive.md') // Exclure le fichier archive.md

  return files.map((fileName) => {
    const fullPath = path.join(projectsDirectory, fileName)
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data, content } = matter(fileContents)

    return {
      title: data.title,
      slug: data.slug || fileName.replace(/\.md$/, ''),
      category: data.category,
      media: data.media,
      content: content.trim()
    } as Project
  })
}
