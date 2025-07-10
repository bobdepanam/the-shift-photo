// src/hooks/useGsapScrollFade.ts

'use client'

import { useEffect } from 'react'
import { fadeIn } from '@/utils/gsap'

export const useGsapScrollFade = (selector: string) => {
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>(selector)

    elements.forEach((el, index) => {
      fadeIn(el, index * 0.1) // petit décalage pour effet cascade
    })
  }, [selector])
}
