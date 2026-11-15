'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import ScrollImageItem from './ScrollImageItem'
import ArchivePreviewOverlay from './ArchivePreviewOverlay'
import styles from '@/styles/components/ArchiveGrid.module.scss'
import ProjectFilter from '@/components/ProjectGrid/ProjectFilter'
import { THUMB_FLIGHT_ENABLED, prepareThumbFlight, prepareThumbFlightWhenIdle } from '@/utils/thumbFlight'
import type { Media } from '@/types/project'

export type ArchiveImage = { src: string; width?: number; height?: number }

/** Fiche d'un projet Commissions, partagée par toutes ses images */
export type ArchiveProjectMeta = {
  title: string
  category: string
  year?: string
  summary?: string
  url?: string
  /** Images du projet, dans l'ordre du .md (navigation de l'aperçu) */
  images: ArchiveImage[]
}

type ArchiveGridProps = {
  media: GridMedia[]
  projects: Record<string, ArchiveProjectMeta>
}

type ActivePreview = { slug: string; index: number }

type GridMedia = Media & { __category?: string; __slug?: string }

type Node =
  | { kind: 'image'; id: string; media: GridMedia; index: number }
  | { kind: 'spacer'; span: number }

/** RNG stable pour la répartition des spacers */
function makeRand(seedInit = 7331) {
  let seed = seedInit >>> 0
  return (min: number, max: number) => {
    seed = (seed * 1664525 + 1013904223) >>> 0
    const r = seed / 0xffffffff
    return Math.floor(min + r * (max - min + 1))
  }
}

export default function ArchiveGrid({ media, projects }: ArchiveGridProps) {
  /**
   * ✅ Toggle filters UI
   * - false: cache le composant ProjectFilter (pas assez de contenu / categories)
   * - true: affiche les filtres et active le filtering
   */
  const filtersEnabled = false

  const [active, setActive] = useState<ActivePreview | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>('all')

  const STEP = 48
  const [limit, setLimit] = useState<number>(STEP)

  const categories = useMemo(() => {
    const set = new Set<string>()
    media.forEach((m) => {
      if (m.type !== 'image') return
      const cat = m.__category
      if (cat && cat !== 'unknown') set.add(cat)
    })
    const sorted = Array.from(set).sort((a, b) => a.localeCompare(b))
    return ['all', ...sorted]
  }, [media])

  // ✅ Si filtersEnabled=false, on ignore la catégorie et on renvoie tout le media
  const filteredMedia = useMemo(() => {
    if (!filtersEnabled) return media
    return activeCategory === 'all'
      ? media
      : media.filter((m) => m.__category === activeCategory)
  }, [media, activeCategory, filtersEnabled])

  const visibleMedia = useMemo(() => filteredMedia.slice(0, limit), [filteredMedia, limit])

  useEffect(() => {
    setLimit(STEP)
  }, [activeCategory])

  // 1) ne garder que les images
  const images = useMemo(
    () =>
      visibleMedia
        .filter((m) => m.type === 'image')
        .map((m, idx) => ({ id: `${idx}-${m.src}`, media: m })),
    [visibleMedia]
  )

  // 2) séquence items + spacers
  const nodes: Node[] = useMemo(() => {
    const out: Node[] = []
    const rand = makeRand(20250918)

    images.forEach((src, i) => {
      if (i > 0 && rand(0, 100) < 18) out.push({ kind: 'spacer', span: rand(1, 2) })
      out.push({ kind: 'image', id: src.id, media: src.media, index: i })
      if (rand(0, 100) < 8) out.push({ kind: 'spacer', span: 1 })
    })

    return out
  }, [images])

  // Vignette d'origine (point de départ/arrivée de la transition) — ref : aucun re-rendu
  const sourceThumbRef = useRef<HTMLElement | null>(null)

  // Transition prête avant le premier clic : chargement au repos du navigateur
  useEffect(() => prepareThumbFlightWhenIdle(THUMB_FLIGHT_ENABLED), [])

  // Ouverture : on retrouve le projet de l'image et sa position dans ce projet
  const openPreview = useCallback(
    (item: GridMedia, thumbBox: HTMLElement | null) => {
      const slug = item.__slug
      if (!slug || !projects[slug]) return
      const index = projects[slug].images.findIndex((image) => image.src === item.src)
      sourceThumbRef.current = thumbBox
      setActive({ slug, index: Math.max(0, index) })
    },
    [projects]
  )

  const closePreview = useCallback(() => setActive(null), [])

  const activeProject = active ? projects[active.slug] : null

  const projectLabel = (item: GridMedia) => {
    const project = item.__slug ? projects[item.__slug] : undefined
    return project ? `Open ${project.title}` : 'Open preview'
  }

  return (
    // Secours si le repos n'est pas encore survenu : survol / pointerdown (idempotent)
    <div
      className={styles.archiveWrapper}
      onPointerEnter={THUMB_FLIGHT_ENABLED ? () => void prepareThumbFlight() : undefined}
      onPointerDownCapture={THUMB_FLIGHT_ENABLED ? () => void prepareThumbFlight() : undefined}
    >
      {/* ✅ Filters UI (optionnel) */}
      {filtersEnabled && (
        <div>
          <ProjectFilter
            activeCategory={activeCategory}
            onSelect={setActiveCategory}
            categories={categories}
          />
        </div>
      )}

      <div className={styles.archiveGridVertical}>
        {nodes.map((node, idx) => {
          if (node.kind === 'spacer') {
            return (
              <div
                key={`spacer-${idx}`}
                className={styles.spacer}
                style={{ gridColumn: `span ${node.span}` }}
                aria-hidden
              />
            )
          }

          return (
            <div key={`img-${node.media.src}-${idx}`} className={styles.item}>
              <ScrollImageItem
                src={node.media.src}
                label={projectLabel(node.media)}
                onClick={(thumbBox) => openPreview(node.media, thumbBox)}
              />
            </div>
          )
        })}
      </div>

      {limit < filteredMedia.length && (
        <div className={styles.archiveLoadMore}>
          <button type="button" onClick={() => setLimit((prev) => prev + STEP)}>
            Load more
          </button>
        </div>
      )}

      {/* Preview centrale (click-to-preview) */}
      <AnimatePresence>
        {active && activeProject ? (
          <ArchivePreviewOverlay
            key={active.slug}
            project={activeProject}
            initialIndex={active.index}
            sourceThumb={sourceThumbRef.current}
            onClose={closePreview}
          />
        ) : null}
      </AnimatePresence>
    </div>
  )
}
