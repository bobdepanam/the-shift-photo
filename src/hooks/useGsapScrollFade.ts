// src/hooks/useGsapScrollFade.ts

'use client'

import { useEffect } from 'react'
import { fadeIn } from '@/utils/gsap'
import { getMotionTokens, prefersReducedMotion } from '@/utils/motionTokens'

export const useGsapScrollFade = (selector: string) => {
  useEffect(() => {
    if (prefersReducedMotion()) return

    const { durationFast, durationBase, easingOut } = getMotionTokens()
    const fadeDuration = (durationBase || 0.25) * 4 // align to ~1s using token scale
    const elements = document.querySelectorAll<HTMLElement>(selector)

    elements.forEach((el, index) => {
      fadeIn(el, index * durationFast, fadeDuration, easingOut) // petit décalage pour effet cascade
    })
  }, [selector])
}
