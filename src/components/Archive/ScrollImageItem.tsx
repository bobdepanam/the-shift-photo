'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { useState } from 'react'
import styles from '@/styles/components/ArchiveGrid.module.scss'

type Props = {
  src: string
  onClick?: () => void
}

export default function ScrollImageItem({ src, onClick }: Props) {
  const [isLoaded, setIsLoaded] = useState(false)

  return (
    <motion.div
      className={styles.gridItem}
      onClick={onClick}
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
          className={`${styles.thumb} ${isLoaded ? styles.isLoaded : ''}`}
          unoptimized
          onLoadingComplete={() => setIsLoaded(true)}
        />
      </div>
    </motion.div>
  )
}
