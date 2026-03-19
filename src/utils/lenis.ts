// src/utils/lenis.ts

import Lenis from 'lenis'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { prefersReducedMotion } from './motionTokens'

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

export const initLenis = () => {
  if (lenisInstance) return lenisInstance

  const reduceMotion = prefersReducedMotion()
  const isMobile = isCoarsePointer()

  lenisInstance = new Lenis({
    duration: 1.2,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: !reduceMotion,
    direction: 'vertical',
    gestureDirection: 'vertical',
    smoothTouch: false,
  })

  if (!reduceMotion && !isMobile && rafId === null) {
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
}
