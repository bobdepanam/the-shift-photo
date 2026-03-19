import type { Metadata } from 'next'
import { getAllProjects } from '@/data/projects/getAllProjects'
import PageIntro from '@/components/PageIntro/PageIntro'
import ArchiveGrid from '@/components/Archive/ArchiveGrid'
import Section from '@/components/Slow/Section/Section'
import { seededShuffle } from '@/utils/seededShuffle'
import type { Project } from '@/types/project'
import styles from '@/styles/components/ArchivePage.module.scss'

export const metadata: Metadata = {
  title: 'commissions',
  description: 'Selected commissions and professional collaborations across image and design.',
}

export default async function ArchivePage() {
  const allProjects: Project[] = await getAllProjects()
  const archiveProjects = allProjects.filter((project) => project.archive)

  const todaySeed = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Paris',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())

  const archiveMedia = archiveProjects.flatMap((project) =>
    (project.media ?? [])
      .filter((media) => media.type === 'image')
      .map((media) => ({ ...media, __category: project.category }))
  )

  if (!archiveMedia.length) {
    return (
      <div className={styles.archiveWrapper}>
        <h1>commissions</h1>
        <p>No commissions found.</p>
      </div>
    )
  }

  const shuffled = seededShuffle(archiveMedia, todaySeed)
  const displayed = shuffled

  return (
    <div className={styles.archiveWrapper}>
      {/* 🧾 Intro de section */}
      <PageIntro
        title="commissions"
        breadcrumb="index . commissions"
        subtitle={
          <>Selected client work, directed with the same precision as the studio practice.</>
        }
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
