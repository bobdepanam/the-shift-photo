// src/utils/gsap.ts

import { gsap } from 'gsap'

export const fadeIn = (
  element: HTMLElement | null,
  delay = 0,
  duration = 1,
  ease: string | gsap.EaseFunction = 'power3.out'
) => {
  if (!element) return

  gsap.fromTo(
    element,
    { opacity: 0, y: 50 },
    {
      opacity: 1,
      y: 0,
      duration,
      delay,
      ease,
    }
  )
}
