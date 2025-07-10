import { getAllProjects } from '@/data/projects/getAllProjects'
import PageIntro from '@/components/PageIntro/PageIntro'
import ArchiveGrid from '@/components/Archive/ArchiveGrid'
import Breadcrumb from '@/components/Beadcrumb/Breadcrumb'
import Section from '@/components/Slow/Section/Section'
import type { Project } from '@/types/project'
import styles from '@/styles/components/Archive.module.scss'

export default function ArchivePage() {
  const allProjects: Project[] = getAllProjects()

  const media = allProjects.flatMap((project) =>
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
        imageSrc="/images/bastardz/bastardz_18.png"
        quote="Beauty and quality need the right time to be conceived and realised even in a world that is in too much of a hurry."
        title="Show me"
      />
    </div>
  )
}
