'use client'

import { useRef, useEffect } from 'react'
import styles from '@/styles/components/MaskVideo.module.scss'

type MaskVideoProps = {
  src: string
}

// 🎯 Réglages du masque
const INITIAL_MASK_SIZE = 0.8
const TARGET_MASK_SIZE = 30
const EASING = 0.15
// En dessous de cet écart, le lissage a convergé (≈ 0,03 % de mask-size) : on arrête la boucle
const EPSILON = 1e-5

export default function MaskVideo({ src }: MaskVideoProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const stickyRef = useRef<HTMLDivElement | null>(null)
  const easedScrollProgress = useRef(0)

  useEffect(() => {
    const container = containerRef.current
    const sticky = stickyRef.current
    if (!container || !sticky) return

    let rafId: number | null = null
    let containerHeight = container.getBoundingClientRect().height
    let lastMaskSize = ''

    // 🌀 Même calcul qu'avant : progression lissée → taille du masque
    const tick = () => {
      rafId = null

      const scrollProgress = sticky.offsetTop / (containerHeight - window.innerHeight)
      const delta = scrollProgress - easedScrollProgress.current
      easedScrollProgress.current += delta * EASING

      const newMaskSize =
        (INITIAL_MASK_SIZE + TARGET_MASK_SIZE * easedScrollProgress.current) * 100 + '%'

      if (newMaskSize !== lastMaskSize) {
        sticky.style.maskSize = newMaskSize
        sticky.style.webkitMaskSize = newMaskSize
        lastMaskSize = newMaskSize
      }

      // La boucle ne tourne que tant que le lissage n'a pas rejoint la cible
      if (Math.abs(delta) > EPSILON) {
        rafId = requestAnimationFrame(tick)
      }
    }

    const start = () => {
      if (rafId === null) rafId = requestAnimationFrame(tick)
    }

    const resizeObserver = new ResizeObserver(() => {
      containerHeight = container.getBoundingClientRect().height
      start()
    })
    resizeObserver.observe(container)

    window.addEventListener('scroll', start, { passive: true })
    window.addEventListener('resize', start)
    start()

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId)
      resizeObserver.disconnect()
      window.removeEventListener('scroll', start)
      window.removeEventListener('resize', start)
    }
  }, [])

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
