'use client'

import { useEffect, useRef, useCallback } from 'react'
import styles from '@/styles/components/Cursor.module.scss'

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const targetRef = useRef({ x: -100, y: -100 })
  const currentRef = useRef({ x: -100, y: -100 })
  const rafRef = useRef<number | null>(null)
  const hoverRef = useRef(false)

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t

  const loop = useCallback(() => {
    const el = cursorRef.current
    if (!el) return

    currentRef.current.x = lerp(currentRef.current.x, targetRef.current.x, 0.28)
    currentRef.current.y = lerp(currentRef.current.y, targetRef.current.y, 0.28)

    el.style.transform = `translate(${currentRef.current.x}px, ${currentRef.current.y}px)`

    rafRef.current = requestAnimationFrame(loop)
  }, [])

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return

    const el = cursorRef.current
    if (!el) return

    // Delay init on first visit to avoid competing with intro animation (~3.75s)
    const introSeen = sessionStorage.getItem('intro-seen') === '1'
    const initDelay = introSeen ? 0 : 4000

    const onMove = (e: MouseEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY }
    }

    const onOver = (e: MouseEvent) => {
      const target = e.target as Element
      const labelEl = target.closest('[data-cursor-label]')
      if (labelEl) {
        hoverRef.current = true
        el.setAttribute('data-state', 'label')
        el.setAttribute('data-label', labelEl.getAttribute('data-cursor-label') ?? '')
      } else if (target.closest('a, button, [data-cursor-hover]')) {
        hoverRef.current = true
        el.setAttribute('data-state', 'hover')
        el.removeAttribute('data-label')
      }
    }

    const onOut = (e: MouseEvent) => {
      const target = e.target as Element
      if (target.closest('[data-cursor-label], a, button, [data-cursor-hover]')) {
        hoverRef.current = false
        el.setAttribute('data-state', 'default')
        el.removeAttribute('data-label')
      }
    }

    const onDown = () => el.setAttribute('data-state', 'click')
    const onUp = () => {
      const label = el.getAttribute('data-label')
      el.setAttribute('data-state', hoverRef.current ? (label ? 'label' : 'hover') : 'default')
    }

    const startCursor = () => {
      document.addEventListener('mousemove', onMove)
      document.addEventListener('mouseover', onOver)
      document.addEventListener('mouseout', onOut)
      document.addEventListener('mousedown', onDown)
      document.addEventListener('mouseup', onUp)
      rafRef.current = requestAnimationFrame(loop)
    }

    const timer = initDelay > 0 ? setTimeout(startCursor, initDelay) : (startCursor(), undefined)

    return () => {
      if (timer) clearTimeout(timer)
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseout', onOut)
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('mouseup', onUp)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [loop])

  return (
    <div
      ref={cursorRef}
      className={styles.cursor}
      data-state="default"
      aria-hidden="true"
    />
  )
}
