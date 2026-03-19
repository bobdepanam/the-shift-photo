'use client'

import { useEffect } from 'react'
import { prefersReducedMotion } from '@/utils/motionTokens'

const ATTR = '[data-reveal]'
const REVEAL_THRESHOLDS = Array.from({ length: 11 }, (_, i) => i / 10)

export function useScrollReveal(): void {
  useEffect(() => {
    const reduce = prefersReducedMotion()

    if (reduce) {
      document.querySelectorAll<HTMLElement>(ATTR).forEach((el) => {
        el.style.setProperty('--reveal-progress', '1')
        el.style.removeProperty('will-change')
      })
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const target = entry.target as HTMLElement
          const ratio = Math.max(0, Math.min(1, entry.intersectionRatio))
          target.style.setProperty('--reveal-progress', ratio.toFixed(3))
        })
      },
      {
        root: null,
        threshold: REVEAL_THRESHOLDS,
      }
    )

    const observed = new WeakSet<Element>()

    const register = (root: Element | Document) => {
      root.querySelectorAll<HTMLElement>(ATTR).forEach((el) => {
        if (observed.has(el)) return
        observed.add(el)
        el.style.setProperty('--reveal-progress', '0')
        el.style.setProperty('will-change', 'opacity')
        observer.observe(el)
      })
    }

    register(document)

    const mutationObserver = new MutationObserver((records) => {
      records.forEach((record) => {
        record.addedNodes.forEach((node) => {
          if (node instanceof Element && node.matches?.(ATTR)) {
            const parent = node.parentNode
            if (parent instanceof Element || parent instanceof Document) {
              register(parent)
            } else {
              register(document)
            }
          }
          if (node instanceof Element) register(node)
        })
      })
    })

    mutationObserver.observe(document.body, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      mutationObserver.disconnect()
    }
  }, [])
}
