'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { motion, useScroll, useTransform } from 'framer-motion'
import styles from '@/styles/components/ArchiveGrid.module.scss'

type ScrollImageItemProps = {
  src: string
  onHover: () => void
  onLeave: () => void
  isHovered: boolean
}

export default function ScrollImageItem({
  src,
  onHover,
  onLeave,
  isHovered,
}: ScrollImageItemProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const scale = useTransform(scrollYProgress, [0, 0.4, 1], [1, 0.8, 1])

  return (
    <motion.div
      ref={ref}
      className={styles.gridItem}
      style={{ scale }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <Image
        src={src}
        alt="archive-thumb"
        width={300}
        height={300}
        style={{ filter: isHovered ? 'grayscale(0)' : 'grayscale(100%)' }}
      />
    </motion.div>
  )
}
