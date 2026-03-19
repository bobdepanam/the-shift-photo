// src/data/project/getAllProjects.ts

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { Project } from '@/types/project';
import { unstable_cache } from 'next/cache';

const PROJECTS_DIR = path.join(process.cwd(), 'src/data/projects');

const _getAllProjects = (includeArchive: boolean): Project[] => {
  const fileNames = fs.readdirSync(PROJECTS_DIR)
    .filter((file) => file.endsWith('.md') && (includeArchive || file !== 'archive.md'));

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
      featured: data.featured ?? false,
      archive: data.archive ?? false,
      home: data.home ?? false,
      homeOrder:
        typeof data.homeOrder === 'number'
          ? data.homeOrder
          : null,
    };
  });
};

export const getAllProjects = unstable_cache(
  async (includeArchive = false) => _getAllProjects(includeArchive),
  ['all-projects'],
  { revalidate: false }
);
