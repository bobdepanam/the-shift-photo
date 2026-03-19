import type { Metadata } from 'next'
import { ReactElement } from 'react'
import { getAllProjects } from '@/data/projects/getAllProjects'
import ProjectGridWrapper from '@/components/ProjectGrid/ProjectGridWrapper'
import type { Project } from '@/components/ProjectGrid/ProjectGrid'
// import Description from '@/components/Slow/Description/description'

export const metadata: Metadata = {
  title: 'index',
  description: 'Image-led index of visual research, photography, and hybrid work.',
}

export default async function Home(): Promise<ReactElement> {
  const allProjects: Project[] = await getAllProjects()
  const homeProjects = allProjects
    .filter((project) => project.home)
    .sort((a, b) => (a.homeOrder ?? 999) - (b.homeOrder ?? 999))
  const projects: Project[] = homeProjects.length ? homeProjects : allProjects

  return (
    <main>


      {/* 🖼️ Grille des projets */}
      <ProjectGridWrapper projects={projects} showFilters={false} />

      {/* 🐢 Section "Slow" */}
      {/* <Description
        imageSrc="/images/london/motion-without-focus.webp"
        text="La lenteur est une forme de luxe dans un monde pressé."
        title="Slow Living"
        textColor="inherit"
      /> */}
    </main>
  )
}
