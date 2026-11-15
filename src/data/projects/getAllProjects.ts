// src/data/project/getAllProjects.ts

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { Project } from '@/types/project';

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
      // Champs facultatifs (aperçu Commissions) — absents = non affichés
      ...(typeof data.summary === 'string' && data.summary.trim()
        ? { summary: data.summary.trim() }
        : {}),
      ...(typeof data.url === 'string' && data.url.trim() ? { url: data.url.trim() } : {}),
      ...(data.year != null && String(data.year).trim() ? { year: String(data.year).trim() } : {}),
    };
  });
};

// Pas de unstable_cache : sa clé fixe (['all-projects']) ne dépend pas du contenu
// des .md, et le Data Cache persiste entre builds (.next/cache, restauré par Vercel).
// Résultat : un projet ajouté ou modifié n'apparaissait pas. Les pages qui lisent
// ces données sont statiques — la lecture des .md n'a lieu qu'au build.
export const getAllProjects = async (includeArchive = false): Promise<Project[]> =>
  _getAllProjects(includeArchive);
