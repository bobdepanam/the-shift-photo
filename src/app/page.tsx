import { ReactElement } from 'react'
import { getAllProjects } from '@/data/projects/getAllProjects'
import ProjectGridWrapper from '@/components/ProjectGrid/ProjectGridWrapper'
import type { Project } from '@/components/ProjectGrid/ProjectGrid'
import ParallaxText from '@/components/Parallaxtext/Parallaxtext'
import Description from '@/components/Slow/Description/description'

export default function Home(): ReactElement {
  const projects: Project[] = getAllProjects()

  return (
    <main>
      {/* 🌀 Parallax header */}
      <ParallaxText
        sections={[
          {
            imageSrc: '/images/craft/macshift_03.gif',
            // videoSrc: '/videos/intro_shift.mp4',   
            // poster: '/images/name/dark_poster.webp',    
            subheading: '',
            heading: 'The Shift',
            headingColor: 'white',
            subheadingColor: 'inherit',
          },
        ]}
      />

      {/* 🖼️ Grille des projets */}
      <ProjectGridWrapper projects={projects} />

      {/* 🐢 Section "Slow" */}
      <Description
        imageSrc="/images/london/london_9.webp"
        text="La lenteur est une forme de luxe dans un monde pressé."
        title="Slow Living"
        textColor="inherit"
      />
    </main>
  )
}
