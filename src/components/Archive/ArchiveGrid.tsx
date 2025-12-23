'use client'

import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import ScrollImageItem from './ScrollImageItem'
import ArchivePreviewOverlay from './ArchivePreviewOverlay'
import styles from '@/styles/components/ArchiveGrid.module.scss'
import type { Media } from '@/types/project'

type ArchiveGridProps = {
  media: Media[]
}

type Node =
  | { kind: 'image'; id: string; media: Media; index: number }
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

export default function ArchiveGrid({ media }: ArchiveGridProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  // 1) ne garder que les images
  const images = useMemo(
    () =>
      media
        .filter((m) => m.type === 'image')
        .map((m, idx) => ({ id: `${idx}-${m.src}`, media: m })),
    [media]
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

  const goNext = () => {
    setActiveIndex((prev) => {
      if (prev === null || images.length === 0) return prev
      return (prev + 1) % images.length
    })
  }

  const activeMedia = activeIndex === null ? null : images[activeIndex]?.media

  return (
    <div className={styles.archiveWrapper}>
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
                onClick={() => setActiveIndex(node.index)}
              />
            </div>
          )
        })}
      </div>

      {/* Preview centrale (click-to-preview) */}
      <AnimatePresence>
        {activeMedia ? (
          <ArchivePreviewOverlay image={activeMedia} onClose={() => setActiveIndex(null)} onNext={goNext} />
        ) : null}
      </AnimatePresence>
    </div>
  )
}
