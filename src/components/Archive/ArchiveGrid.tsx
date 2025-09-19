'use client'

import { useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import ScrollImageItem from './ScrollImageItem'
import styles from '@/styles/components/ArchiveGrid.module.scss'

type ArchiveGridProps = {
  media: { type: string; src: string }[]
}

type Node =
  | { kind: 'image'; src: string }
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
  const [hoveredImage, setHoveredImage] = useState<string | null>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  // 1) ne garder que les images
  const images = useMemo(
    () => media.filter((m) => m.type === 'image').map((m) => m.src),
    [media]
  )

  // 2) séquence items + spacers
  const nodes: Node[] = useMemo(() => {
    const out: Node[] = []
    const rand = makeRand(20250918)

    images.forEach((src, i) => {
      if (i > 0 && rand(0, 100) < 18) out.push({ kind: 'spacer', span: rand(1, 2) })
      out.push({ kind: 'image', src })
      if (rand(0, 100) < 8) out.push({ kind: 'spacer', span: 1 })
    })

    return out
  }, [images])

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
            <div key={`img-${node.src}-${idx}`} className={styles.item}>
              <ScrollImageItem
                src={node.src}
                onHover={() => setHoveredImage(node.src)}
                onLeave={() => setHoveredImage(null)}
              />
            </div>
          )
        })}
      </div>

      {/* Preview centrale au survol */}
      <AnimatePresence>
        {hoveredImage && (
          <motion.div
            className={`${styles.previewCenter} ${styles.previewCenterShown}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <div className={styles.previewContent} ref={previewRef}>
              <Image
                src={hoveredImage}
                alt="preview"
                width={800}
                height={800}
                unoptimized
                sizes="(min-width: 1280px) 800px, 80vw"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
