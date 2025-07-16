// src/components/Section.tsx
'use client'

import Image from 'next/image'
import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import styles from '@/styles/components/Section.module.scss'

type SectionProps = {
  imageSrc: string
  quote: string
  title: string
}

export default function Section({ imageSrc, quote, title }: SectionProps) {
  const container = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start end', 'end start']
  })

  const y = useTransform(scrollYProgress, [0, 1], ['-10%', '10%'])

  return (
    <div ref={container} className={styles.sectionWrapper}>
      <div className={styles.sectionContent}>
        <p className={styles.quote}>{quote}</p>
        <p className={styles.title}>{title}</p>
      </div>

      <div className={styles.sectionBackground}>
        <motion.div style={{ y }} className={styles.imageWrapper}>
          <Image src={imageSrc} fill alt="Background" style={{ objectFit: 'cover' }} />
        </motion.div>
      </div>
    </div>
  )
}