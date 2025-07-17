// src/utils/lenis.ts

import Lenis from 'lenis'

export const initLenis = () => {
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
  })

  const raf = (time: number) => {
    lenis.raf(time)
    requestAnimationFrame(raf)
  }

  // ✅ Lance la boucle ici, dans l'init
  requestAnimationFrame(raf)

  return lenis
}
