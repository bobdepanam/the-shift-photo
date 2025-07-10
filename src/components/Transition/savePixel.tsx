'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import styles from '@/styles/components/PixelTransition.module.scss'
import { usePathname } from 'next/navigation'

const anim = {
  initial: { opacity: 0 },
  open: (delay: number[]) => ({
    opacity: 1,
    transition: { duration: 0, delay: 0.02 * delay[0] }
  }),
  closed: (delay: number[]) => ({
    opacity: 0,
    transition: { duration: 0, delay: 0.02 * delay[1] }
  })
}

export default function PixelTransition() {
  const [visible, setVisible] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setVisible(true)

    const timeout = setTimeout(() => {
      setVisible(false)

      // ⬆️ Scroll to top après animation
      window.scrollTo({ top: 0, behavior: 'smooth' })

      // ➕ Active le contenu
      const pageEl = document.getElementById('pageContent')
      if (pageEl) {
        pageEl.classList.remove('page-hidden')
        pageEl.classList.add('page-visible')
      }
    }, 800)

    return () => clearTimeout(timeout)
  }, [pathname])

  const shuffle = (a: number[]) => {
    let j, x, i
    for (i = a.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1))
      x = a[i]
      a[i] = a[j]
      a[j] = x
    }
    return a
  }

  const getBlocks = (colIndex: number) => {
    const nbOfBlocks = 30
    const shuffledIndexes = shuffle([...Array(nbOfBlocks).keys()])
    return shuffledIndexes.map((randomIndex, i) => (
      <motion.div
        key={i}
        className={styles.block}
        variants={anim}
        initial="initial"
        animate={visible ? 'open' : 'closed'}
        custom={[colIndex + randomIndex, 20 - colIndex + randomIndex]}
      />
    ))
  }

  return (
    <div className={styles.pixelBackground}>
      {[...Array(30)].map((_, colIndex) => (
        <div key={colIndex} className={styles.column}>
          {getBlocks(colIndex)}
        </div>
      ))}
    </div>
  )
}
