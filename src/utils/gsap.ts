// src/utils/gsap.ts

import { gsap } from 'gsap'

export const fadeIn = (element: HTMLElement | null, delay = 0, duration = 1) => {
  if (!element) return

  gsap.fromTo(
    element,
    { opacity: 0, y: 50 },
    {
      opacity: 1,
      y: 0,
      duration,
      delay,
      ease: 'power3.out',
    }
  )
}

export const scaleIn = (element: HTMLElement | null, delay = 0, duration = 1) => {
  if (!element) return

  gsap.fromTo(
    element,
    { opacity: 0, scale: 0.95 },
    {
      opacity: 1,
      scale: 1,
      duration,
      delay,
      ease: 'power2.out',
    }
  )
}

export const simpleParallax = (element: HTMLElement | null, intensity = 20) => {
  if (!element) return

  gsap.to(element, {
    yPercent: intensity,
    ease: 'none',
    scrollTrigger: {
      trigger: element,
      start: 'top bottom',
      scrub: true,
    },
  })
}
