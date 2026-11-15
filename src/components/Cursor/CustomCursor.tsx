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

    const setDefault = () => {
      hoverRef.current = false
      el.setAttribute('data-state', 'default')
      el.removeAttribute('data-label')
    }

    /**
     * État du curseur selon l'élément survolé — l'ancêtre le plus proche décide :
     * - [data-cursor-label]   → libellé (ex. VIEW, CLOSE)
     * - [data-cursor-default] → point normal (zone exclue d'un parent à libellé)
     * - a, button, [data-cursor-hover] → hover
     * Retourne false si rien ne correspond.
     */
    const applyFromTarget = (target: Element | null) => {
      const match = target?.closest(
        '[data-cursor-label], [data-cursor-default], a, button, [data-cursor-hover]'
      )
      if (!match) return false

      if (match.hasAttribute('data-cursor-label')) {
        hoverRef.current = true
        el.setAttribute('data-state', 'label')
        el.setAttribute('data-label', match.getAttribute('data-cursor-label') ?? '')
      } else if (match.hasAttribute('data-cursor-default')) {
        setDefault()
      } else {
        hoverRef.current = true
        el.setAttribute('data-state', 'hover')
        el.removeAttribute('data-label')
      }
      return true
    }

    const onOver = (e: MouseEvent) => {
      applyFromTarget(e.target as Element)
    }

    // Recalcul ponctuel (ex. un overlay qui défile sous une souris immobile,
    // ou qui disparaît) : déclenché uniquement par l'événement `cursor:refresh`
    const onRefresh = () => {
      const { x, y } = targetRef.current
      if (!applyFromTarget(document.elementFromPoint(x, y))) setDefault()
    }

    const onOut = (e: MouseEvent) => {
      const target = e.target as Element
      if (target.closest('[data-cursor-label], a, button, [data-cursor-hover]')) {
        setDefault()
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
      window.addEventListener('cursor:refresh', onRefresh)
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
      window.removeEventListener('cursor:refresh', onRefresh)
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
