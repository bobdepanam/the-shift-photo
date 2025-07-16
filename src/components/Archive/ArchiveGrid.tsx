'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import styles from '@/styles/components/ArchiveGrid.module.scss'
import { motion, AnimatePresence } from 'framer-motion'
import ScrollImageItem from './ScrollImageItem'

type ArchiveGridProps = {
  media: { type: string; src: string }[]
}

export default function ArchiveGrid({ media }: ArchiveGridProps) {
  const [hoveredImage, setHoveredImage] = useState<string | null>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  const images = media.filter((m) => m.type === 'image').map((m) => m.src)

  return (
    <div className={styles.archiveWrapper}>
      <div className={styles.archiveGridVertical}>
        {images.map((img, index) => (
          <ScrollImageItem
            key={img + index}
            src={img}
            isHovered={hoveredImage === img}
            onHover={() => setHoveredImage(img)}
            onLeave={() => setHoveredImage(null)}
          />
        ))}
      </div>

      <AnimatePresence>
        {hoveredImage && (
          <motion.div
            className={styles.previewCenter}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <motion.div
              className={styles.previewBackdropGlobal}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            />
            <div className={styles.previewContent} ref={previewRef}>
              <Image src={hoveredImage} alt="preview" width={800} height={800} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
