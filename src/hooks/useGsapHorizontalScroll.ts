'use client'

import { useEffect } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function useGsapHorizontalScroll(containerSelector: string, trackSelector: string) {
  useEffect(() => {
    const container = document.querySelector(containerSelector)
    const track = document.querySelector(trackSelector)

    if (!container || !track) return

    // Calculer la largeur totale de la track par rapport au container
    const containerWidth = container.clientWidth
    const trackWidth = track.scrollWidth

    if (trackWidth <= containerWidth) return // Si la track ne déborde pas, pas besoin d'un scroll horizontal

    const ctx = gsap.context(() => {
      // Appliquer le scroll horizontal en fonction du scroll vertical
      gsap.to(track, {
        xPercent: -((trackWidth - containerWidth) / containerWidth) * 100,
        ease: 'none',
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: () => `+=${trackWidth - containerWidth}`, // on anime sur toute la largeur excédentaire
          scrub: true,
          pin: true,
          anticipatePin: 1,
        },
      })
    }, container)

    return () => ctx.revert()
  }, [containerSelector, trackSelector])
}
