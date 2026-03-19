'use client'

import React, { useEffect, type ReactElement } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import Image from 'next/image'
import styles from '@/styles/components/Images.module.scss'
import { opacity } from '@/scripts/anim'

type IndexProps = {
  src: string
  isActive: boolean
  mousePos?: { x: number; y: number }
}

export default function Images({ src, isActive, mousePos = { x: 0, y: 0 } }: IndexProps): ReactElement {
  const xMV = useMotionValue(0)
  const yMV = useMotionValue(0)
  const springX = useSpring(xMV, { stiffness: 80, damping: 20 })
  const springY = useSpring(yMV, { stiffness: 80, damping: 20 })

  useEffect(() => {
    xMV.set(mousePos.x * 20)
    yMV.set(mousePos.y * 15)
  }, [mousePos, xMV, yMV])

  return (
    <motion.div
      variants={opacity}
      initial="initial"
      animate={isActive ? 'open' : 'closed'}
      className={styles.imageContainer}
    >
      <motion.div style={{ x: springX, y: springY, width: '100%', height: '100%' }}>
        <Image
          src={`/images/${src}`}
          fill
          alt="image"
          className={styles.image}
          loading="lazy"
        />
      </motion.div>
    </motion.div>
  )
}
