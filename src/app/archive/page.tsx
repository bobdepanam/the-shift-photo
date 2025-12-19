import { getAllProjects } from '@/data/projects/getAllProjects'
import PageIntro from '@/components/PageIntro/PageIntro'
import ArchiveGrid from '@/components/Archive/ArchiveGrid'
import Breadcrumb from '@/components/Beadcrumb/Breadcrumb'
import Section from '@/components/Slow/Section/Section'
import type { Project } from '@/types/project'
import styles from '@/styles/components/ArchivePage.module.scss'

const ARCHIVE_PROJECT_SLUGS = ['digital', 'mask', 'video', 'branding']

export default function ArchivePage() {
  const allProjects: Project[] = getAllProjects()

  const curatedProjects = allProjects.filter((project) =>
    ARCHIVE_PROJECT_SLUGS.includes(project.slug)
  )
  const sourceProjects =
    curatedProjects.length > 0
      ? curatedProjects
      : allProjects.filter((project) => project.category !== 'photography')

  const media = sourceProjects.flatMap((project) =>
    project.media.map((item) => ({
      type: item.type,
      src: item.src
    }))
  )

  return (
    <div className={styles.archiveWrapper}>
      {/* 🧭 Fil d'Ariane */}
      <Breadcrumb path={['archive']} />

      {/* 🧾 Intro de section */}
      <PageIntro
        title="Archive"
        subtitle="A visual vault of sketches, drafts, snapshots, and fragments—<br />curated chaos from the edges of the shift."
      />

      {/* 🎞️ Grille immersive */}
      <ArchiveGrid media={media} />

      {/* 📜 Citation immersive */}
      <Section
        imageSrc="/images/craft/macshift_02.gif"
        quote="Beauty and quality need the right time to be conceived and realised even in a world that is in too much of a hurry."
        title="Show me"
      />
    </div>
  )
}
