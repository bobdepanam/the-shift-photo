'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import styles from '@/styles/components/ArchiveGrid.module.scss'

type Props = {
  src: string
  onHover?: () => void
  onLeave?: () => void
}

export default function ScrollImageItem({ src, onHover, onLeave }: Props) {
  return (
    <motion.div
      className={styles.gridItem}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
      style={{ position: 'relative' }}
    >
      <div className={styles.thumbBox}>
        <Image
          src={src}
          alt=""
          fill
          sizes="(min-width: 1400px) 12vw, (min-width: 900px) 18vw, 32vw"
          className={styles.thumb}
          unoptimized
        />
      </div>
    </motion.div>
  )
}

