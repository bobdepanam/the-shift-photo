'use client'

import { useCallback, useEffect, useState } from 'react'
import styles from './BackToTop.module.scss'
import { initLenis } from '@/utils/lenis'

const SCROLL_THRESHOLD_VH = 0.65 // 65% of viewport height

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
    <button
      type="button"
      aria-label="Back to top"
      className={`${styles.backToTop} ${visible ? styles.visible : ''}`}
      onClick={handleClick}
    >
      Top
    </button>
  )
}
