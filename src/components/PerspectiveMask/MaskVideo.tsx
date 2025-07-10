'use client'

import { useRef, useEffect, useCallback } from 'react'
import styles from '@/styles/components/MaskVideo.module.scss'

type MaskVideoProps = {
  src: string
}

export default function MaskVideo({ src }: MaskVideoProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const stickyRef = useRef<HTMLDivElement | null>(null)
  const easedScrollProgress = useRef(0)

  // 🎯 Réglages du masque
  const initialMaskSize = 0.8
  const targetMaskSize = 30
  const easing = 0.15

  // 🔄 Calcule la progression de scroll
  const getScrollProgress = useCallback(() => {
    if (stickyRef.current && containerRef.current) {
      const containerHeight = containerRef.current.getBoundingClientRect().height
      const scrollTop = stickyRef.current.offsetTop
      const scrollProgress = scrollTop / (containerHeight - window.innerHeight)
      const delta = scrollProgress - easedScrollProgress.current
      easedScrollProgress.current += delta * easing
      return easedScrollProgress.current
    }
    return 0
  }, [])

  // 🌀 Anime dynamiquement la taille du masque
  const animate = useCallback(() => {
    if (stickyRef.current) {
      const maskSizeProgress = targetMaskSize * getScrollProgress()
      const newMaskSize = (initialMaskSize + maskSizeProgress) * 100 + '%'
      stickyRef.current.style.maskSize = newMaskSize
      stickyRef.current.style.webkitMaskSize = newMaskSize
    }
    requestAnimationFrame(animate)
  }, [getScrollProgress])

  useEffect(() => {
    requestAnimationFrame(animate)
  }, [animate])

  return (
    <main className={styles.main}>
      <div ref={containerRef} className={styles.container}>
        <div ref={stickyRef} className={styles.stickyMask}>
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className={styles.maskVideo}
          >
            <source src={src} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </main>
  )
}
