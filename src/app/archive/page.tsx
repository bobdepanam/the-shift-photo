import type { Metadata } from 'next'
import { getAllProjects } from '@/data/projects/getAllProjects'
import Breadcrumb from '@/components/Beadcrumb/Breadcrumb'
import ArchiveGrid, { type ArchiveProjectMeta } from '@/components/Archive/ArchiveGrid'
import { getPublicImageSize } from '@/utils/imageSize'
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
      .map((media) => ({ ...media, __category: project.category, __slug: project.slug }))
  )

  // Une fiche par projet (pas de répétition par image) : infos + images dans l'ordre du .md
  const archiveProjectsMeta: Record<string, ArchiveProjectMeta> = Object.fromEntries(
    archiveProjects.map((project) => [
      project.slug,
      {
        title: project.title,
        category: project.category,
        ...(project.year ? { year: project.year } : {}),
        ...(project.summary ? { summary: project.summary } : {}),
        ...(project.url ? { url: project.url } : {}),
        images: (project.media ?? [])
          .filter((media) => media.type === 'image')
          .map((media) => {
            const size = getPublicImageSize(media.src)
            return size ? { src: media.src, ...size } : { src: media.src }
          }),
      },
    ])
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
      {/* 🧾 Intro discrète, même langage que /about (index . statement) */}
      <h1 className={styles.visuallyHidden}>commissions</h1>
      <div className={styles.intro}>
        <div className={styles.introCrumb}>
          <Breadcrumb path={['commissions']} />
        </div>
        <p className={styles.introText}>
          Selected client work, directed with the same precision as the studio practice.
        </p>
      </div>

      {/* 🎞️ Grille immersive */}
      <ArchiveGrid media={displayed} projects={archiveProjectsMeta} />

      {/* 📜 Citation immersive */}
      <Section
        imageSrc="/images/craft/macshift_02.gif"
        quote="Beauty and quality need the right time to be conceived and realised even in a world that is in too much of a hurry."
        title="Show me"
      />
    </div>
  )
}
