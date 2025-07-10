'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import styles from '@/styles/components/Images.module.scss'
import { opacity } from '@/scripts/anim'

type IndexProps = {
  src: string
  isActive: boolean
}

export default function Images({ src, isActive }: IndexProps): JSX.Element {
  return (
    <motion.div
      variants={opacity}
      initial="initial"
      animate={isActive ? 'open' : 'closed'}
      className={styles.imageContainer}
    >
      <Image
        src={`/images/${src}`}
        fill
        alt="image"
        className={styles.image}
      />
    </motion.div>
  )
}
