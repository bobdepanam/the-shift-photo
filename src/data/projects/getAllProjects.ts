// src/data/project/getAllProjects.ts

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { Project } from '@/types/project';

const PROJECTS_DIR = path.join(process.cwd(), 'src/data/projects');

/**
 * Charge tous les projets en excluant 'archive.md'
 */
export function getAllProjects(): Project[] {
  const fileNames = fs.readdirSync(PROJECTS_DIR)
    .filter((file) => file.endsWith('.md') && file !== 'archive.md');

  return fileNames.map((fileName) => {
    const filePath = path.join(PROJECTS_DIR, fileName);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContent);

    return {
      title: data.title,
      slug: data.slug || fileName.replace(/\.md$/, ''),
      category: data.category,
      media: data.media,
      content: content.trim(),
    };
  });
}
