'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { animate } from 'framer-motion'

// Exposé globalement pour que TransitionLink puisse le déclencher
export let triggerTransitionIn: (() => Promise<void>) | null = null

export default function PixelTransition() {
  const ref = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const isFirst = useRef(true)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    triggerTransitionIn = () =>
      animate(el, { clipPath: 'inset(0 0% 0 0)' },
        { duration: 0.45, ease: [0.76, 0, 0.24, 1] }).then(() => {})
    return () => { triggerTransitionIn = null }
  }, [])

  useEffect(() => {
    if (isFirst.current) { isFirst.current = false; return }
    const el = ref.current
    if (!el) return
    animate(el, { clipPath: 'inset(0 0% 0 100%)' },
      { duration: 0.5, ease: [0.76, 0, 0.24, 1] })
  }, [pathname])

  return (
    <div
      ref={ref}
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        pointerEvents: 'none',
        background: 'var(--text-color)',
        clipPath: 'inset(0 100% 0 0)',
      }}
    />
  )
}
