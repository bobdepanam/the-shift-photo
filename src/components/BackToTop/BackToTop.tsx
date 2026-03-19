'use client'

import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import styles from './BackToTop.module.scss'
import { initLenis } from '@/utils/lenis'

const SCROLL_THRESHOLD_VH = 0.65

export default function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const threshold = window.innerHeight * SCROLL_THRESHOLD_VH
      setVisible(window.scrollY > threshold)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleClick = useCallback(() => {
    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const lenis = initLenis()
    if (lenis && !reduceMotion) {
      lenis.scrollTo(0, { offset: 0 })
      return
    }

    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' })
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          aria-label="Back to top"
          className={styles.backToTop}
          initial={{ opacity: 0, y: 16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.95 }}
          transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
          onClick={handleClick}
        >
          Top
        </motion.button>
      )}
    </AnimatePresence>
  )
}
