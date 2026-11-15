// src/utils/lenis.ts

import Lenis from 'lenis'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { prefersReducedMotion } from './motionTokens'
import { setLenis } from './lenisInstance'

let lenisInstance: Lenis | null = null
let rafId: number | null = null

const isCoarsePointer = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(pointer: coarse)').matches

const rafLoop = (time: number) => {
  lenisInstance?.raf(time)
  ScrollTrigger.update()
  rafId = requestAnimationFrame(rafLoop)
}

/**
 * Smooth scroll uniquement quand la boucle rAF tourne réellement
 * (pointeur fin, sans prefers-reduced-motion).
 * Dans les autres cas on garde le scroll natif : une instance Lenis sans rAF
 * intercepte la molette (preventDefault) sans jamais faire défiler la page.
 */
export const initLenis = () => {
  if (lenisInstance) return lenisInstance
  if (typeof window === 'undefined') return null
  if (prefersReducedMotion() || isCoarsePointer()) return null

  lenisInstance = new Lenis({
    duration: 1.2,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    syncTouch: false,
  })

  setLenis(lenisInstance)

  if (rafId === null) {
    rafId = requestAnimationFrame(rafLoop)
  }

  return lenisInstance
}

export const destroyLenis = () => {
  if (rafId !== null) {
    cancelAnimationFrame(rafId)
    rafId = null
  }

  lenisInstance?.destroy()
  lenisInstance = null
  setLenis(null)
}
