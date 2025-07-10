import { getAllProjects } from '@/data/projects/getAllProjects'
import ProjectGridWrapper from '@/components/ProjectGrid/ProjectGridWrapper'
import type { Project } from '@/components/ProjectGrid/ProjectGrid'
import ParallaxText from '@/components/Parallaxtext/Parallaxtext'
import Description from '@/components/Slow/Description/description'

export default function Home(): JSX.Element {
  const projects: Project[] = getAllProjects()

  return (
    <main>
      {/* 🌀 Parallax header */}
      <ParallaxText
        sections={[
          {
            imageSrc: '/images/bastardz/bastardz_28.png',
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
        imageSrc="/images/london/london_9.jpg"
        text="La lenteur est une forme de luxe dans un monde pressé."
        title="Slow Living"
        textColor="inherit"
      />
    </main>
  )
}
