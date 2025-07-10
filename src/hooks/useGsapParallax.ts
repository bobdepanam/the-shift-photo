'use client'

import { useEffect } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Hook pour appliquer un effet de parallax sur les éléments cibles au scroll.
 * @param target - Le sélecteur CSS des éléments à animer.
 */
export function useGsapParallax(target: string) {
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>(target)

    if (!elements.length) return

    const animations: gsap.core.Tween[] = []

    elements.forEach((el) => {
      const tween = gsap.to(el, {
        yPercent: -10,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      })

      animations.push(tween)
    })

    return () => {
      animations.forEach((tween) => tween.kill())
    }
  }, [target])
}
