import { getAllProjects } from '@/data/projects/getAllProjects'
import PageIntro from '@/components/PageIntro/PageIntro'
import ArchiveGrid from '@/components/Archive/ArchiveGrid'
import Breadcrumb from '@/components/Beadcrumb/Breadcrumb'
import Section from '@/components/Slow/Section/Section'
import { seededShuffle } from '@/utils/seededShuffle'
import type { Project } from '@/types/project'
import styles from '@/styles/components/ArchivePage.module.scss'

export default function ArchivePage() {
  const allProjects: Project[] = getAllProjects(true)
  const archiveProject = allProjects.find((project) => project.slug === 'archive')

  if (!archiveProject) {
    return (
      <div className={styles.archiveWrapper}>
        <h1>Archive</h1>
        <p>Archive project not found.</p>
      </div>
    )
  }

  const todaySeed = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Paris',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())

  const shuffled = seededShuffle(archiveProject.media ?? [], todaySeed)
  const displayed = shuffled.slice(0, 32)

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
      <ArchiveGrid media={displayed} />

      {/* 📜 Citation immersive */}
      <Section
        imageSrc="/images/craft/macshift_02.gif"
        quote="Beauty and quality need the right time to be conceived and realised even in a world that is in too much of a hurry."
        title="Show me"
      />
    </div>
  )
}
